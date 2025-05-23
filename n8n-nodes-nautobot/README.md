# Nautobot Node for n8n

This repository contains a custom n8n node for interacting with Nautobot, an open-source Network Source of Truth and Network Automation Platform. This node allows you to integrate Nautobot into your n8n workflows to automate tasks related to network device management, data retrieval, and more.

## Installation

There are a few ways to install this node:

1.  **NPM Install (Recommended for published packages):**
    If this package is published to npm, you can install it by running the following command in your n8n user directory (typically `~/.n8n/custom/`):
    ```bash
    npm install n8n-nodes-nautobot
    ```

2.  **Manual Installation (for development or local use):**
    - Clone this repository:
      ```bash
      git clone https://github.com/your-repo/n8n-nodes-nautobot.git
      ```
    - Build the node:
      ```bash
      cd n8n-nodes-nautobot
      npm install
      npm run build
      ```
    - Copy the built `dist` folder and `package.json` into your n8n custom nodes directory:
      ```bash
      # Example:
      mkdir -p ~/.n8n/custom/n8n-nodes-nautobot
      cp -r dist package.json ~/.n8n/custom/n8n-nodes-nautobot/
      ```
    Or, you can link the package if you are actively developing:
      ```bash
      # In the n8n-nodes-nautobot directory
      npm link
      # In your n8n custom nodes directory (~/.n8n/custom/)
      npm link n8n-nodes-nautobot
      ```

3.  **Docker:**
    If you are using Docker, you can build a custom image that includes this node. Refer to the n8n documentation for instructions on adding custom nodes to Docker.

**Prerequisites:**
- n8n version 1.0.0 or later.

After installation, restart your n8n instance to see the Nautobot node available in the editor.

## Configuration

To use the Nautobot node, you need to configure credentials to allow it to authenticate with your Nautobot instance.

1.  **Add New Credential:**
    - In n8n, go to the "Credentials" section.
    - Click "Add credential".
    - Search for "Nautobot API" and select it.

2.  **Configure Credential Fields:**
    - **Nautobot URL**: The base URL of your Nautobot instance (e.g., `https://nautobot.example.com`). Do not include `/api` in this URL.
    - **API Token**: Your Nautobot API token. You can generate this from your Nautobot user profile.

    ![Example of Nautobot Credential Setup](https://via.placeholder.com/400x200.png?text=Nautobot+Credential+Example)
    *(Note: Replace placeholder image with an actual screenshot if available)*

## Supported Operations

Currently, the Nautobot node supports the following operations:

### Get Device

-   **Operation Name**: `Get Device`
-   **Description**: Retrieves a single device from Nautobot by its unique ID.
-   **Input Parameters**:
    -   `deviceId` (String): The UUID of the device to retrieve from Nautobot. This is a required field for this operation.
-   **Output**:
    -   Returns a JSON object representing the full details of the specified device. If the device is not found, it may return an empty result or an error, depending on the API's behavior and node error handling.

    **Example Workflow Snippet:**
    *(Imagine an n8n workflow diagram here showing an input node providing a deviceId, connected to the Nautobot node configured for 'Get Device', outputting to a Code node or another service.)*

## Dependencies

### Runtime Dependencies:

The node relies on the following core n8n packages:
-   `n8n-core`: Provides core functionalities for n8n nodes.
-   `n8n-workflow`: Provides workflow-related functionalities.

### Development Dependencies:

For development and contribution, the following are key dependencies:
-   `typescript`: For writing the node in TypeScript.
-   `@types/node`: TypeScript definitions for Node.js.
-   `eslint` & `prettier`: For code linting and formatting.
-   `jest` & `ts-jest`: For running unit tests.

## Development

If you wish to contribute to this node or modify it:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/n8n-nodes-nautobot.git
    cd n8n-nodes-nautobot
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the node:**
    The node is written in TypeScript and needs to be compiled to JavaScript.
    ```bash
    npm run build
    ```
    This will compile the TypeScript files from `src` into the `dist` directory.

4.  **Watch for changes (development mode):**
    To automatically recompile the node when you make changes to the source files:
    ```bash
    npm run dev
    ```

5.  **Linting and Formatting:**
    ```bash
    npm run lint  # Check for linting errors
    npm run format # Automatically format code
    ```

6.  **Testing:**
    Run unit tests using Jest:
    ```bash
    npm run test
    ```

7.  **Link for local n8n testing:**
    Follow the "Manual Installation" linking steps mentioned above to test your local changes in your n8n instance.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details (if a separate LICENSE file is added, otherwise, specify here).

---

*This documentation is a work in progress and will be updated as more features are added to the node.*
