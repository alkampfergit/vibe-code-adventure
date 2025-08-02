# User Story: Enter Username to Log In

## Title
As a player, I want to enter a username to log in so that I can access the game and resume my previous session if I've played before.

## Description
Players should be able to log in to the game by simply entering a username, without the need for a password or additional authentication steps. If the username already exists in the system, the player is automatically logged in and can resume their previous game session. If the username is new, a new player account is created and the player can start a fresh game.

## Acceptance Criteria
- The login screen prompts the player to enter a username.
- If the username already exists, the player is automatically logged in and can access their previous game state.
- If the username is new, a new player account is created and the player starts with a fresh game.
- The player proceeds to the game immediately after entering a valid username.
- No error messages are shown for "username already taken" since existing usernames result in automatic login.
