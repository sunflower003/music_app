import React from 'react';


export default function Header() {
  const user = JSON.parse(localStorage.getItem('user')) || {
    username: 'Admin',
    avatar: null,
  };

  const avatarUrl = user.avatar
    ? `http://localhost:5000/uploads/avatars/${user.avatar}`
    : 'https://cellphones.com.vn/sforum/wp-content/uploads/2023/10/avatar-trang-4.jpg';

  return (
    <div className={"adlte_header"}>
      <div className={"adlte_userContainer"}>
        <span className={"adlte_username"}>
          {user.username}
        </span>
        <img
          src={avatarUrl}
          alt="avatar"
          width={35}
          height={35}
          className={"adlte_avatar"}
        />
      </div>
    </div>
  );
}