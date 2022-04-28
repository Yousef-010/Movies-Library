const express = require('express')
const data =require('./Movie Data/data.json')
const app = express()
const port = 3001

app.get('/', (req, res) => {
     
  let favMovie = new FavMovie(data.title, data.poster_path, data.overview)
  res.json(favMovie)

})

// hander error
app.use((req, res, next) => {
    res.status(404).send("page not found error")
  })

  app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({"status": 500,"responseText": "Sorry, something went wrong"})
  })

app.get('/favorite',(req,res) => {
    res.send('Welcome to Favorite Page')
})

function FavMovie (title, poster_path, overview){
    this.title=title,
    this.poster_path=poster_path,
    this.overview=overview
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})