
# User Story: Command Synonyms Handling

## Title
As a player, I want the parser to handle common synonyms (e.g., "grab" for "take") so that the game feels more natural.

## Description
The command parser should recognize and correctly interpret common synonyms for actions, allowing players to use different words with the same meaning. This makes the game more accessible and intuitive, as players are not required to memorize specific command words. Synonyms should be mapped to their canonical actions.

## Acceptance Criteria
- The parser recognizes common synonyms for standard commands (e.g., "grab" for "take", "examine" for "look").
- Using a synonym produces the same result as the canonical command.
- The list of supported synonyms is documented and can be referenced by players.
