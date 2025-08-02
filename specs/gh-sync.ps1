# GitHub Issue Synchronization Script for Feature Files
# This script processes .feature.md files and syncs them with GitHub issues

# Import PoshLog module
Install-Module PoShLog
Import-Module PoShLog -ErrorAction Stop

# Initialize logger
Start-Logger -Console

# Ensure we're in the correct directory
Set-Location $PSScriptRoot

# Function to extract issue number from filename
function Get-IssueNumberFromFilename {
    param([string]$filename)
    
    if ($filename -match '\.gh(\d+)\.feature\.md$') {
        return $matches[1]
    }
    if ($filename -match '\.gh(\d+)\.userstory\.md$') {
        return $matches[1]
    }
    return $null
}

# Function to extract feature code from filename (e.g., 0100 from 0100-login.feature.md)
function Get-FeatureCodeFromFilename {
    param([string]$filename)
    
    if ($filename -match '^(\d{4})') {
        return $matches[1]
    }
    return $null
}

# Function to get title from filename (remove .ghXXX.feature.md or .feature.md or .ghXXX.userstory.md or .userstory.md)
function Get-TitleFromFilename {
    param([string]$filename)
    
    $title = $filename -replace '\.gh\d+\.feature\.md$', ''
    $title = $title -replace '\.feature\.md$', ''
    $title = $title -replace '\.gh\d+\.userstory\.md$', ''
    $title = $title -replace '\.userstory\.md$', ''
    return $title
}

# Function to ensure required labels exist
function Ensure-LabelsExist {
    Write-InfoLog "Checking for required labels..."
    
    try {
        # Get existing labels
        $existingLabels = gh label list --json name --jq '.[].name' 2>&1
        
        if ($existingLabels -like "*error*") {
            Write-ErrorLog "Failed to get existing labels: $existingLabels"
            return $false
        }
        
        $labelNames = $existingLabels -split "`n" | Where-Object { $_ -ne "" }
        
        # Check and create Feature label if needed
        if ($labelNames -notcontains "Feature") {
            Write-InfoLog "Creating 'Feature' label..."
            $result = gh label create "Feature" --description "Feature implementation" --color "0052cc" 2>&1
            if ($result -like "*error*") {
                Write-ErrorLog "Failed to create Feature label: $result"
            } else {
                Write-InfoLog "Successfully created 'Feature' label"
            }
        } else {
            Write-InfoLog "'Feature' label already exists"
        }
        
        # Check and create UserStory label if needed
        if ($labelNames -notcontains "UserStory") {
            Write-InfoLog "Creating 'UserStory' label..."
            $result = gh label create "UserStory" --description "User story implementation" --color "1d76db" 2>&1
            if ($result -like "*error*") {
                Write-ErrorLog "Failed to create UserStory label: $result"
            } else {
                Write-InfoLog "Successfully created 'UserStory' label"
            }
        } else {
            Write-InfoLog "'UserStory' label already exists"
        }
        
        return $true
    }
    catch {
        Write-ErrorLog "Failed to ensure labels exist: $_"
        return $false
    }
}

# Function to create a new GitHub issue
function New-GitHubIssue {
    param(
        [string]$title,
        [string]$body,
        [string]$parentIssueNumber = $null
    )
    
    # Add appropriate icon prefix to title
    $iconPrefix = if ($parentIssueNumber) { "👤 " } else { "🔧 " }
    $titleWithIcon = $iconPrefix + $title
    
    Write-InfoLog "Creating new GitHub issue: $titleWithIcon"
    Write-InfoLog "Issue body length: $($body.Length) characters"
    
    # Don't modify the body for user stories - keep them clean
    
    try {
        # Determine appropriate label
        $label = if ($parentIssueNumber) { "UserStory" } else { "Feature" }
        
        # Create issue with appropriate label
        $result = gh issue create --title $titleWithIcon --body $body --label $label 2>&1
        
        # Check if label error occurred (fallback for old label names)
        if ($result -like "*not found*" -and $result -like "*label*") {
            Write-InfoLog "$label label not found, trying fallback labels..."
            $fallbackLabel = if ($parentIssueNumber) { "user story" } else { "feature" }
            $result = gh issue create --title $title --body $body --label $fallbackLabel 2>&1
            
            # If fallback also fails, create without label
            if ($result -like "*not found*" -and $result -like "*label*") {
                Write-InfoLog "Fallback label '$fallbackLabel' also not found, creating issue without label..."
                $result = gh issue create --title $titleWithIcon --body $body 2>&1
            }
        }
        
        Write-InfoLog "GitHub CLI raw output: '$result'"
        Write-InfoLog "Output type: $($result.GetType().Name)"
        
        # Convert to string if it's not already
        $resultString = $result.ToString()
        Write-InfoLog "GitHub CLI string output: '$resultString'"
        
        # Check if the result contains an error message
        if ($resultString -like "*error*" -or $resultString -like "*not found*") {
            Write-ErrorLog "GitHub CLI returned an error: '$resultString'"
            return $null
        }
        
        # Try different patterns to extract issue number
        if ($resultString -match 'https://github\.com/[^/]+/[^/]+/issues/(\d+)') {
            Write-InfoLog "Extracted issue number using URL pattern: $($matches[1])"
            return $matches[1]
        }
        elseif ($resultString -match '#(\d+)') {
            Write-InfoLog "Extracted issue number using # pattern: $($matches[1])"
            return $matches[1]
        }
        elseif ($resultString -match '/issues/(\d+)') {
            Write-InfoLog "Extracted issue number using /issues/ pattern: $($matches[1])"
            return $matches[1]
        }
        elseif ($resultString -match '\b(\d+)\b') {
            Write-InfoLog "Extracted issue number using number pattern: $($matches[1])"
            return $matches[1]
        }
        else {
            Write-ErrorLog "Could not extract issue number from GitHub CLI output: '$resultString'"
            Write-ErrorLog "Available regex matches: $($matches | ConvertTo-Json -Compress)"
            
            # Fallback: Try to get the latest issue number from the repository
            Write-InfoLog "Attempting fallback method to get latest issue number..."
            try {
                $latestIssues = gh issue list --limit 1 --json number --state all 2>&1
                Write-InfoLog "Latest issues query result: '$latestIssues'"
                
                if ($latestIssues -match '"number":(\d+)') {
                    $potentialIssueNumber = $matches[1]
                    Write-InfoLog "Found potential issue number from latest issues: $potentialIssueNumber"
                    
                    # Verify this issue was just created by checking its title
                    $issueDetails = gh issue view $potentialIssueNumber --json title 2>&1
                    Write-InfoLog "Issue details for #$potentialIssueNumber : '$issueDetails'"
                    
                    if ($issueDetails -like "*$title*") {
                        Write-InfoLog "Confirmed issue #$potentialIssueNumber matches our title"
                        return $potentialIssueNumber
                    }
                }
            }
            catch {
                Write-ErrorLog "Fallback method also failed: $_"
            }
            
            return $null
        }
    }
    catch {
        Write-ErrorLog "Failed to create GitHub issue: $($_.Exception.Message)"
        Write-ErrorLog "Error details: $($_ | ConvertTo-Json -Compress)"
        return $null
    }
}

# Function to ensure issue has correct label
function Ensure-IssueLabel {
    param(
        [string]$issueNumber,
        [string]$labelName
    )
    
    Write-InfoLog "Checking labels for issue #$issueNumber"
    
    try {
        # Get current labels for the issue
        $currentLabels = gh issue view $issueNumber --json labels --jq '.labels[].name' 2>&1
        
        if ($currentLabels -like "*error*" -or $currentLabels -like "*not found*") {
            Write-ErrorLog "Failed to get labels for issue #$issueNumber : $currentLabels"
            return
        }
        
        $labelList = $currentLabels -split "`n" | Where-Object { $_ -ne "" }
        
        # Check if the required label is already present
        if ($labelList -contains $labelName) {
            Write-InfoLog "Issue #$issueNumber already has '$labelName' label"
            return
        }
        
        # Add the required label
        Write-InfoLog "Adding '$labelName' label to issue #$issueNumber"
        $result = gh issue edit $issueNumber --add-label $labelName 2>&1
        
        if ($result -like "*error*" -or $result -like "*not found*") {
            Write-ErrorLog "Failed to add label '$labelName' to issue #$issueNumber : $result"
        } else {
            Write-InfoLog "Successfully added '$labelName' label to issue #$issueNumber"
        }
    }
    catch {
        Write-ErrorLog "Failed to ensure label for issue #$issueNumber : $_"
    }
}

# Function to update an existing GitHub issue
function Update-GitHubIssue {
    param(
        [string]$issueNumber,
        [string]$body,
        [bool]$isUserStory = $false
    )
    
    Write-InfoLog "Updating GitHub issue #$issueNumber"
    
    try {
        gh issue edit $issueNumber --body $body
        Write-InfoLog "Successfully updated issue #$issueNumber"
        
        # Ensure correct label is applied
        $labelName = if ($isUserStory) { "UserStory" } else { "Feature" }
        Ensure-IssueLabel -issueNumber $issueNumber -labelName $labelName
    }
    catch {
        Write-ErrorLog "Failed to update GitHub issue #$issueNumber : $_"
    }
}

# Function to add a sub-issue using GitHub GraphQL API
function Add-SubIssue {
    param(
        [string]$parentIssueNumber,
        [string]$childIssueNumber
    )
    
    Write-InfoLog "Adding issue #$childIssueNumber as sub-issue of #$parentIssueNumber"
    
    try {
        # Get internal ID of parent issue
        $parentIdResult = gh issue view $parentIssueNumber --json id --jq '.id' 2>&1
        if ($parentIdResult -like "*error*" -or $parentIdResult -like "*not found*") {
            Write-ErrorLog "Could not get parent issue ID for #$parentIssueNumber : $parentIdResult"
            return $false
        }
        
        # Get internal ID of child issue
        $childIdResult = gh issue view $childIssueNumber --json id --jq '.id' 2>&1
        if ($childIdResult -like "*error*" -or $childIdResult -like "*not found*") {
            Write-ErrorLog "Could not get child issue ID for #$childIssueNumber : $childIdResult"
            return $false
        }
        
        Write-InfoLog "Parent ID: $parentIdResult, Child ID: $childIdResult"
        
        # Define GraphQL mutation query string
        $query = @"
mutation addSubIssue(`$issueId: ID!, `$subIssueId: ID!) {
  addSubIssue(input: { issueId: `$issueId, subIssueId: `$subIssueId }) {
    issue { number }
    subIssue { number }
  }
}
"@

        # Run GraphQL mutation
        $result = gh api graphql `
            -H "GraphQL-Features: sub_issues" `
            -f query="$query" `
            -f issueId="$parentIdResult" `
            -f subIssueId="$childIdResult" 2>&1
        
        if ($result -like "*error*") {
            Write-ErrorLog "Failed to create sub-issue relationship: $result"
            return $false
        }
        
        Write-InfoLog "Successfully added issue #$childIssueNumber as sub-issue of #$parentIssueNumber"
        return $true
    }
    catch {
        Write-ErrorLog "Failed to add sub-issue relationship: $_"
        return $false
    }
}

# Function to add a task to a parent issue (fallback for when sub-issues are not available)
function Add-TaskToParentIssue {
    param(
        [string]$parentIssueNumber,
        [string]$childIssueNumber,
        [string]$childTitle
    )
    
    Write-InfoLog "Adding task for issue #$childIssueNumber to parent issue #$parentIssueNumber (fallback method)"
    
    try {
        # Get current parent issue body
        $parentIssueJson = gh issue view $parentIssueNumber --json body 2>&1
        
        if ($parentIssueJson -like "*error*" -or $parentIssueJson -like "*not found*") {
            Write-ErrorLog "Could not retrieve parent issue #$parentIssueNumber : $parentIssueJson"
            return
        }
        
        $parentIssueData = $parentIssueJson | ConvertFrom-Json
        $currentBody = $parentIssueData.body
        
        # Check if we already have a "User Stories" section
        $taskListEntry = "- [ ] $childTitle (#$childIssueNumber)"
        
        if ($currentBody -like "*## User Stories*") {
            # Check if this specific child issue is already referenced
            if ($currentBody -notlike "*#$childIssueNumber)*") {
                # Find the User Stories section and add the new task
                $lines = $currentBody -split "`n"
                $updatedLines = @()
                $inUserStoriesSection = $false
                $taskAdded = $false
                
                foreach ($line in $lines) {
                    $updatedLines += $line
                    
                    if ($line -match "^## User Stories") {
                        $inUserStoriesSection = $true
                    }
                    elseif ($inUserStoriesSection -and $line -match "^## " -and $line -notmatch "^## User Stories") {
                        # We've hit another section, add the task before this section
                        if (-not $taskAdded) {
                            $updatedLines = $updatedLines[0..($updatedLines.Length-2)] + $taskListEntry + $updatedLines[-1]
                            $taskAdded = $true
                        }
                        $inUserStoriesSection = $false
                    }
                }
                
                # If we're still in the User Stories section at the end, add the task
                if ($inUserStoriesSection -and -not $taskAdded) {
                    $updatedLines += $taskListEntry
                }
                
                $updatedBody = $updatedLines -join "`n"
                gh issue edit $parentIssueNumber --body $updatedBody
                Write-InfoLog "Added task to existing User Stories section in parent issue #$parentIssueNumber"
            }
            else {
                Write-InfoLog "Task for issue #$childIssueNumber already exists in parent issue #$parentIssueNumber"
            }
        }
        else {
            # Add new User Stories section at the end
            $userStoriesSection = "`n`n## User Stories`n$taskListEntry"
            $updatedBody = $currentBody + $userStoriesSection
            gh issue edit $parentIssueNumber --body $updatedBody
            Write-InfoLog "Added new User Stories section to parent issue #$parentIssueNumber"
        }
    }
    catch {
        Write-ErrorLog "Failed to add task to parent issue #$parentIssueNumber : $_"
    }
}

# Function to rename file to include GitHub issue number
function Rename-FileWithIssueNumber {
    param(
        [string]$originalPath,
        [string]$issueNumber
    )
    
    $directory = Split-Path $originalPath -Parent
    $filename = Split-Path $originalPath -Leaf
    $title = Get-TitleFromFilename $filename
    
    # Determine the correct extension based on file type
    $newFilename = if ($filename -like "*.userstory.md") {
        "$title.gh$issueNumber.userstory.md"
    } else {
        "$title.gh$issueNumber.feature.md"
    }
    
    $newPath = Join-Path $directory $newFilename
    
    try {
        Rename-Item $originalPath $newPath
        Write-InfoLog "Renamed file to: $newFilename"
    }
    catch {
        Write-ErrorLog "Failed to rename file: $_"
    }
}

# Function to process user stories for a specific feature code
function Process-UserStories {
    param(
        [string]$featureCode,
        [string]$parentIssueNumber
    )
    
    Write-InfoLog "Processing user stories for feature code: $featureCode"
    
    # Check if directory exists
    if (-not (Test-Path $featureCode -PathType Container)) {
        Write-InfoLog "No directory found for feature code: $featureCode"
        return
    }
    
    # Get all .userstory.md files in the feature directory
    $userStoryFiles = Get-ChildItem -Path $featureCode -Filter "*.userstory.md" -File
    
    if ($userStoryFiles.Count -eq 0) {
        Write-InfoLog "No user story files found in directory: $featureCode"
        return
    }
    
    Write-InfoLog "Found $($userStoryFiles.Count) user story file(s) in $featureCode"
    
    foreach ($file in $userStoryFiles) {
        Write-InfoLog "Processing user story file: $($file.Name)"
        
        # Read file content
        try {
            $content = Get-Content $file.FullName -Raw
            if ([string]::IsNullOrWhiteSpace($content)) {
                Write-WarningLog "User story file $($file.Name) is empty, skipping..."
                continue
            }
        }
        catch {
            Write-ErrorLog "Failed to read user story file $($file.Name): $_"
            continue
        }
        
        # Check if file has GitHub issue number
        $issueNumber = Get-IssueNumberFromFilename $file.Name
        $title = Get-TitleFromFilename $file.Name
        
        if ($issueNumber) {
            # File has issue number - update existing issue
            Write-InfoLog "Found user story issue reference: #$issueNumber"
            Update-GitHubIssue -issueNumber $issueNumber -body $content -isUserStory $true
            
            # Try to add as sub-issue, fallback to task if it fails
            $subIssueResult = Add-SubIssue -parentIssueNumber $parentIssueNumber -childIssueNumber $issueNumber
            if (-not $subIssueResult) {
                Write-InfoLog "Sub-issue creation failed, falling back to task list method"
                Add-TaskToParentIssue -parentIssueNumber $parentIssueNumber -childIssueNumber $issueNumber -childTitle $title
            }
        }
        else {
            # File doesn't have issue number - create new issue as child of parent feature
            Write-InfoLog "No issue reference found, creating new user story issue as child of #$parentIssueNumber..."
            $newIssueNumber = New-GitHubIssue -title $title -body $content -parentIssueNumber $parentIssueNumber
            
            if ($newIssueNumber) {
                Write-InfoLog "Created user story issue #$newIssueNumber"
                
                # Try to add as sub-issue, fallback to task if it fails
                $subIssueResult = Add-SubIssue -parentIssueNumber $parentIssueNumber -childIssueNumber $newIssueNumber
                if (-not $subIssueResult) {
                    Write-InfoLog "Sub-issue creation failed, falling back to task list method"
                    Add-TaskToParentIssue -parentIssueNumber $parentIssueNumber -childIssueNumber $newIssueNumber -childTitle $title
                }
                
                # Verify the issue was created by listing it
                try {
                    $verifyResult = gh issue view $newIssueNumber --json number,title 2>&1
                    Write-InfoLog "User story issue verification result: $verifyResult"
                    
                    if ($verifyResult -like "*not found*" -or $verifyResult -like "*error*") {
                        Write-ErrorLog "User story issue #$newIssueNumber was not found after creation. Skipping file rename."
                    }
                    else {
                        Rename-FileWithIssueNumber -originalPath $file.FullName -issueNumber $newIssueNumber
                    }
                }
                catch {
                    Write-ErrorLog "Failed to verify user story issue #$newIssueNumber : $_"
                }
            }
            else {
                Write-ErrorLog "Failed to create user story issue for file $($file.Name). Issue number was null or empty."
            }
        }
    }
}

# Main script execution
Write-InfoLog "Starting GitHub Issue Synchronization Script"

# Check if gh CLI is available
try {
    gh --version | Out-Null
    Write-InfoLog "GitHub CLI is available"
}
catch {
    Write-ErrorLog "GitHub CLI (gh) is not installed or not in PATH. Please install it first."
    Close-Logger
    exit 1
}

# Check if we're in a git repository and authenticated
try {
    $repoInfo = gh repo view --json name,owner 2>&1
    Write-InfoLog "Repository info: $repoInfo"
    
    if ($repoInfo -like "*not a git repository*" -or $repoInfo -like "*error*") {
        Write-ErrorLog "Not in a git repository or not authenticated with GitHub."
        Close-Logger
        exit 1
    }
}
catch {
    Write-ErrorLog "Failed to verify repository or authentication: $_"
    Close-Logger
    exit 1
}

# Ensure required labels exist before processing files
if (-not (Ensure-LabelsExist)) {
    Write-ErrorLog "Failed to ensure required labels exist. Continuing without label validation..."
}

# Get all .feature.md files in current directory
$featureFiles = Get-ChildItem -Path "." -Filter "*.feature.md" -File

if ($featureFiles.Count -eq 0) {
    Write-WarningLog "No .feature.md files found in current directory."
    Close-Logger
    exit 0
}

Write-InfoLog "Found $($featureFiles.Count) feature file(s) to process."

foreach ($file in $featureFiles) {
    Write-InfoLog "Processing file: $($file.Name)"
    
    # Read file content
    try {
        $content = Get-Content $file.FullName -Raw
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-WarningLog "File $($file.Name) is empty, skipping..."
            continue
        }
    }
    catch {
        Write-ErrorLog "Failed to read file $($file.Name): $_"
        continue
    }
    
    # Check if file has GitHub issue number
    $issueNumber = Get-IssueNumberFromFilename $file.Name
    $title = Get-TitleFromFilename $file.Name
    $featureCode = Get-FeatureCodeFromFilename $file.Name
    
    if ($issueNumber) {
        # File has issue number - update existing issue
        Write-InfoLog "Found issue reference: #$issueNumber"
        Update-GitHubIssue -issueNumber $issueNumber -body $content -isUserStory $false
        
        # Process user stories for this feature using existing issue number
        if ($featureCode) {
            Process-UserStories -featureCode $featureCode -parentIssueNumber $issueNumber
        }
    }
    else {
        # File doesn't have issue number - create new issue
        Write-InfoLog "No issue reference found, creating new issue..."
        $newIssueNumber = New-GitHubIssue -title $title -body $content
        
        if ($newIssueNumber) {
            Write-InfoLog "Created issue #$newIssueNumber"
            
            # Verify the issue was created by listing it
            try {
                $verifyResult = gh issue view $newIssueNumber --json number,title 2>&1
                Write-InfoLog "Issue verification result: $verifyResult"
                
                if ($verifyResult -like "*not found*" -or $verifyResult -like "*error*") {
                    Write-ErrorLog "Issue #$newIssueNumber was not found after creation. Skipping file rename and user story processing."
                }
                else {
                    Rename-FileWithIssueNumber -originalPath $file.FullName -issueNumber $newIssueNumber
                    
                    # Process user stories for this feature using new issue number
                    if ($featureCode) {
                        Process-UserStories -featureCode $featureCode -parentIssueNumber $newIssueNumber
                    }
                }
            }
            catch {
                Write-ErrorLog "Failed to verify issue #$newIssueNumber : $_"
            }
        }
        else {
            Write-ErrorLog "Failed to create issue for file $($file.Name). Issue number was null or empty."
        }
    }
}

Write-InfoLog "Synchronization completed!"
Close-Logger