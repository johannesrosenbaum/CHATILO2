import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChatRoom } from '../../types/chat';

interface SidebarProps {
  chatRooms: ChatRoom[];
  onSelectChatRoom: (chatRoom: ChatRoom) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chatRooms, onSelectChatRoom }) => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2>Local Chat Rooms</h2>
      <ul>
        {chatRooms.map((room) => (
          <li key={room.id} onClick={() => onSelectChatRoom(room)}>
            {room.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;