/**
 * Danh sách role
 * Định nghĩa các role và quyền hạn trong hệ thống
 */

const ROLES = {
  // Role cho người dùng thông thường
  USER: 'user',
  
  // Role cho admin
  ADMIN: 'admin',
  
  // Role cho moderator
  MODERATOR: 'moderator',
  
  // Role cho premium user
  PREMIUM: 'premium'
};

// Mô tả chi tiết cho từng role
const ROLE_DESCRIPTIONS = {
  [ROLES.USER]: {
    name: 'Người dùng',
    description: 'Người dùng thông thường, có thể tạo playlist và nghe nhạc',
    permissions: [
      'read:songs',
      'read:playlists',
      'create:playlists',
      'update:own_playlists',
      'delete:own_playlists',
      'read:own_profile',
      'update:own_profile'
    ]
  },
  
  [ROLES.PREMIUM]: {
    name: 'Người dùng Premium',
    description: 'Người dùng trả phí, có thêm quyền nâng cao',
    permissions: [
      'read:songs',
      'read:playlists',
      'create:playlists',
      'update:own_playlists',
      'delete:own_playlists',
      'read:own_profile',
      'update:own_profile',
      'download:songs',
      'offline:playlists',
      'high_quality:streaming'
    ]
  },
  
  [ROLES.MODERATOR]: {
    name: 'Điều hành viên',
    description: 'Có quyền quản lý nội dung và người dùng',
    permissions: [
      'read:songs',
      'read:playlists',
      'create:playlists',
      'update:own_playlists',
      'delete:own_playlists',
      'read:own_profile',
      'update:own_profile',
      'moderate:content',
      'manage:users',
      'read:all_playlists',
      'update:all_playlists',
      'delete:all_playlists'
    ]
  },
  
  [ROLES.ADMIN]: {
    name: 'Quản trị viên',
    description: 'Có toàn quyền quản lý hệ thống',
    permissions: [
      'read:songs',
      'read:playlists',
      'create:playlists',
      'update:own_playlists',
      'delete:own_playlists',
      'read:own_profile',
      'update:own_profile',
      'moderate:content',
      'manage:users',
      'read:all_playlists',
      'update:all_playlists',
      'delete:all_playlists',
      'manage:songs',
      'manage:system',
      'view:analytics',
      'manage:roles'
    ]
  }
};

// Danh sách tất cả role
const ALL_ROLES = Object.values(ROLES);

// Kiểm tra role có hợp lệ không
const isValidRole = (role) => {
  return ALL_ROLES.includes(role);
};

// Lấy permissions của role
const getRolePermissions = (role) => {
  return ROLE_DESCRIPTIONS[role]?.permissions || [];
};

// Kiểm tra user có permission không
const hasPermission = (userRole, permission) => {
  const permissions = getRolePermissions(userRole);
  return permissions.includes(permission);
};

// So sánh level của role (cao hơn = số lớn hơn)
const getRoleLevel = (role) => {
  const levels = {
    [ROLES.USER]: 1,
    [ROLES.PREMIUM]: 2,
    [ROLES.MODERATOR]: 3,
    [ROLES.ADMIN]: 4
  };
  return levels[role] || 0;
};

// Kiểm tra role có quyền cao hơn role khác không
const hasHigherRole = (userRole, targetRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(targetRole);
};

module.exports = {
  ROLES,
  ROLE_DESCRIPTIONS,
  ALL_ROLES,
  isValidRole,
  getRolePermissions,
  hasPermission,
  getRoleLevel,
  hasHigherRole
};
