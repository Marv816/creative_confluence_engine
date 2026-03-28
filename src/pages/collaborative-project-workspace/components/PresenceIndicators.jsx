import React from 'react';

const PresenceIndicators = ({ activeUsers, currentUserId }) => {
  const otherUsers = activeUsers?.filter(u => u?.userId !== currentUserId);

  if (otherUsers?.length === 0) {
    return null;
  }

  const colors = ['bg-cyan-500', 'bg-purple-500', 'bg-yellow-500', 'bg-green-500', 'bg-pink-500'];

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {otherUsers?.slice(0, 3)?.map((user, index) => (
          <div
            key={user?.userId}
            className="relative"
            title={user?.user?.full_name || 'Collaborator'}
          >
            <img
              src={user?.user?.avatar_url || '/assets/images/no_image.png'}
              alt={user?.user?.full_name || 'User'}
              className="w-8 h-8 rounded-full border-2 border-black object-cover"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${colors?.[index % colors?.length]} rounded-full border border-black`} />
          </div>
        ))}
        {otherUsers?.length > 3 && (
          <div className="w-8 h-8 rounded-full border-2 border-black bg-white/10 flex items-center justify-center text-xs font-bold text-white">
            +{otherUsers?.length - 3}
          </div>
        )}
      </div>
      <span className="text-sm text-gray-400 hidden sm:inline">
        {otherUsers?.length} {otherUsers?.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
};

export default PresenceIndicators;
