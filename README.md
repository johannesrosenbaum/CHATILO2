# CHATILO

CHATILO is a local chat application that allows users to connect and communicate with people in their immediate vicinity. Users can register and log in using their email or Google account, and they can participate in chat rooms based on their geographical location.

## Features

- **User Authentication**: Users can register via email or log in using their Google account.
- **Local Chat Rooms**: Automatically generated chat rooms based on the user's location, with options to create event-specific chat rooms.
- **Multimedia Messaging**: Send and receive text, images, audio, and video messages.
- **Likes and Galleries**: Users can like messages, and each chat room has a gallery of images sorted by likes.
- **User Location**: Users must enable location services to access local chat rooms, with a fallback to a general chat room for those who do not share their location.

## Project Structure

```
chatilo-app
├── src
│   ├── components
│   │   ├── auth
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── chat
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── navigation
│   │   │   ├── Sidebar.tsx
│   │   │   └── ChatList.tsx
│   │   └── gallery
│   │       └── ImageGallery.tsx
│   ├── services
│   │   ├── authService.ts
│   │   ├── locationService.ts
│   │   ├── chatService.ts
│   │   └── googleAuth.ts
│   ├── utils
│   │   ├── locationUtils.ts
│   │   └── constants.ts
│   ├── types
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   └── location.ts
│   ├── screens
│   │   ├── HomeScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── ProfileScreen.tsx
│   └── App.tsx
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chatilo-app.git
   ```
2. Navigate to the project directory:
   ```
   cd chatilo-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to access the application.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.