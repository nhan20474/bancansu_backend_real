function normalizeRole(role) {
    if (!role) return '';
    return role
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}

module.exports = function(requiredRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || (!user.role && !user.VaiTro)) {
            return res.status(401).json({ message: 'Chưa đăng nhập hoặc thiếu thông tin quyền.' });
        }
        const userRole = normalizeRole(user.role || user.VaiTro);
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const rolesLower = roles.map(r => normalizeRole(r));
        if (!rolesLower.includes(userRole)) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
        }
        next();
    };
};
