const roles = {
    admin: ['readAny', 'writeAny', 'deleteAny'],
    user: ['readOwn', 'writeOwn'],
};

const checkRole = (role, action) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const permissions = roles[req.user.role];
    if (permissions.includes(action)) return next();
    res.status(403).json({ message: 'Forbidden' });
};

module.exports = { roles, checkRole };
