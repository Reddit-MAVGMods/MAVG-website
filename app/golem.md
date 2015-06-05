#Golem API Specification

Golem is MAVG's universal API designed to handle all online interactions necessary for any MAVG game. This provides an easy way for online games to be developed without having to deal with implementing all the miniscule details of authentication, matchmaking, servers, and whatever other centralized online activities a game requires. For help with interacting with the Golem API, to request a new feature/bugfix, or to request a reference code for a new game, [contact /u/Hydrothermal on reddit](http://www.reddit.com/message/compose/?to=Hydrothermal).

All interactions with Golem are handled via HTTP GETs or POSTs. All URLs have a root of `http(s)://www.redditmavg.com/golem/`. Two standard parameters are available for all requests:

* `ref`: Required (string). This is a 16-character alphanumeric reference code unique to each game. Requests without a `ref` query variable or with an invalid value will be rejected.
* `format`: Optional (string). If specified, data returned by a request will be in the supplied format; if unspecified, the format will default to JSON. The following formats are available:
    * json
    * csv

Any URL-unsafe characters included in a request should be escaped. All responses contain a `success` field, which is a boolean ('true' or 'false') indicating whether or not the action was successful. If an action is unsuccessful, the only other response field will be `error`, which will have a string value indicating why the action failed.

##Authentication

Golem offers a simple authentication API for games that require players to log in. This allows game clients to provide registration and login forms with a great deal of freedom and a minimal amount of boilerplate to communicate with the server. Keep in mind that accounts are shared across all games, and usernames must be unique.

###Registering

**Type**: POST  
**URL**: `/auth/register`  
**SSL required**: yes  
**Parameters**:

* `username`: Required (string). The username requested by the registering user. Usernames must be between 2 and 32 characters in length and can only contain letters, numbers, and underscores.
* `password`: Required (string). The desired password. Passwords must be at least 1 character in length, but can contain any characters.
* `email`: Optional (string). If specified, this will be stored and used if the user requests a password reset.
* `login`: Optional (boolean). If true, the registering user will be immediately logged in if registration is successful. If false or unspecified, the registration will occur without attempting to log in.

Registers a new account. Refer to [*logging in*](#logging-in) for more information on what happens when you use the `login` parameter.

**Example successful return value(s)**:

* If `login` is false:
```json
{
    "success": true
}
```

* If `login` is true:
```json   
{
    "success": true,
    "token": "[authentication token]"
}
```

###Logging in

**Type**: POST  
**URL**: `/auth/login`  
**SSL required**: yes  
**Parameters**:

* `username`: Required (string). This is the username of the user logging in (case-insensitive).
* `password`: Required (string). This is the password of the user logging in.

Logs in with an existing account. A successful response returns an authentication token string that can be passed back to the server with subsequent requests that require authentication. This token expires 2 hours after being issued; refer to [*token renewal*](#token-renewal) if you need to acquire a new token with a refreshed expiration date.

**Example successful return value(s)**:

```json   
{
    "success": true,
    "token": "[authentication token]"
}
```

###Token renewal

**Type**: POST  
**URL**: `/auth/renew_token`  
**SSL required**: no  
**Parameters**:

* `token`: Required (string). The token to be renewed.

Verifies an authentication token and returns a new one with a refreshed expiration date.

**Example successful return value(s)**:

```json   
{
    "success": true,
    "token": "[authentication token]"
}
```

##Servers

Multiplayer games that aren't hardcoded to use a single server require a means of determining what servers are available and which one to use. While this can also be dealt with by hardcoding a list of addresses to connect to, Golem offers a server API to simplify this process for game developers by providing interfaces for listing, adding, updating, and otherwise managing servers.

###Listing servers

**Type**: GET  
**URL**: `/servers/list`  
**SSL required**: no  
**Parameters**:

* `game`: Required (string). The ID of the game to list servers for. This is *not* the 16-character reference code, but a different, shorter, public identifier.

Lists all currently-online servers for a given game. Each server in the list will have a server ID and an address; additional information such as the number of players connected may be included, depending on the specifications defined by the game in question.

**Example successful return value(s)**:

```json   
{
    "success": true,
    "servers": [
        {
            "id": "[server id]",
            "address": "127.0.0.1:2048",
            "name": "Server 1",
            "players": 17
        },
        {
            "id": "[server id]",
            "address": "redditmavg.com:8000",
            "name": "Server 2",
            "players": 13
        }
    ]
}
```

###Adding a server

**Type**: POST  
**URL**: `/servers/add`  
**SSL required**: no  
**Parameters**:

* `game`: Required (string). The ID of the game to add a server to. This is *not* the 16-character reference code, but a different, shorter, public identifier.
* `address`: Required (string). The address of the server. Note that the default port for MAVG games is 2048 - if the server is listening on a different port, this must be included in the address (e.g. `127.0.0.1:1337`).
* `data`: Optional (string). If a game's specification calls for a server to identify itself with more information than its ID and address, this must be included as stringified JSON via the `data` parameter.

Adds a new server to a game's server list. A server that fails to [refresh](#refreshing-a-server) itself for 60 seconds will be removed from the server list. A successful response will include the server's ID and a server token for it to include with its next refresh request.

**Example successful return value(s)**:

```json   
{
    "success": true,
    "id": "[server id]",
    "token": "[server token]"
}
```

###Refreshing a server

**Type**: POST  
**URL**: `/servers/refresh`  
**SSL required**: no  
**Parameters**:

* `token`: Required (string). The token of the server to refresh.
* `update`: Optional (string). If false or unspecified, the server will simply be refreshed without changing its listing information. If specified, this must be stringified JSON indicating what information should be updated. It follows the same format as the parameters for [adding a server](#adding-a-server). Omitted keys will be left unchanged.

Refreshes a server. This method should be called at least every 60 seconds by a server that does not wish to be automatically removed from the server list. It will discard the old server token and return a new one that should be included with the next refresh request. This is also used for updating information about a server, via the `update` parameter.

**Example successful return value(s)**:

```json   
{
    "success": true,
    "token": "[server token]"
}
```