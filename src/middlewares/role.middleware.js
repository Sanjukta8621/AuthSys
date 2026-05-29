function authorizedRoles(...roles) {
    return (req,res,next) => {

        if(!roles.includes(req.user.role)){

            return res.status(403).json({
            message: "Access denied!"

         })
        }
        next()
    }
}

module.exports = authorizeRoles


//hof used here