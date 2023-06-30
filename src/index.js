const app = require('./app')
const port =3010// process.env.PORT

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})