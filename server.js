const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
const bodyParser = require("body-parser");
require("dotenv").config();


const PORT = process.env.PORT  || 3000
const data = require('./Movie Data/data.json')
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended :false}));
app.use(bodyParser.json());

// declerations 
let API_KEY =process.env.API_KEY ;

 

const {Client} =  require('pg')
// const client = new Client(url)


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  }
})



//routes 
app.get('/trending', getDataTrending)

app.get('/genre',getGenres)

app.get('/watch',getProviders)

app.get('/search', getDataSearch)

app.get('/', (req, res) => {
     
  let favMovie = new FavMovie(data.title, data.poster_path, data.overview)
  res.json(favMovie)

})

app.get('/getallMovies',getMoviesData)

// CRUD operations
app.post('/addMovie',addMovie)

app.get('/getSpicificMovie/:id',getSpicificMovie)

app.delete('/deleteMovie/:id',deleteMovie)

app.put('/updateMovie/:id',updateMovie)





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

// functions 
function getDataTrending(req,res){
  let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;
  axios.get(url)
  .then(result => {
      // res.json(result.data.results);
      // throw new Error
      let movies = result.data.results.map((movie) => {
        return new TrendMovie(
          movie.id,
          movie.title,
          movie.release_date,
          movie.poster_path,
          movie.overview
          
          );
          
        });
        res.json(movies);
        
        
      }
      )
  .catch((error => {
    console.log(error);
    res.send("error in getting data from API")
  }))
}

function getGenres(req,res){
  let url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;
  axios.get(url)
  .then(result => {
    console.log(result.data.genres);
    
    // throw new Error
    let genre = result.data.genres.map((genre) => {
        return new Genre (
          genre.id,
          genre.name
          )
      });
      res.json(genre);
      
      
    }
    )
    .catch((error => {
      console.log(error);
      res.send(error)
}))
}


function getDataSearch(req, res) {
  
  let movieName = req.query.name;
  // console.log(movieName);
  
  // https://api.themoviedb.org/3/search/movie?api_key=e081bc4fb03a9e99615491efebc747da&query=Uncharted&page=1

  let url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${movieName}&page=1`;
  console.log(url);
  axios 
  .get(url)
  .then((result) => {
          let searchMovie= result.data.results.map((movie) => {
          return new TrendMovie(
            movie.id,
            movie.title,
            movie.release_date,
            movie.poster_path,
            movie.overview
            
          );
          
          
        });
        console.log(searchMovie);
        res.json(searchMovie);
        
        
        
      })
    .catch((error => {
      console.log(error.error);
      res.json(error)
}))

}

function getProviders (req, res) {
  let url = `https://api.themoviedb.org/3/watch/providers/movie?api_key=${API_KEY}&language=en-US`;
  
  axios.get(url)
  .then(result => {
    console.log(result.data.results);
    
      // throw new Error
      let provider = result.data.results.map((provider) => {
        return new Providers (
          provider.provider_id,
          provider.provider_name
        )
      });
      res.json(provider);

      
  }
)
  .catch((error => {
    console.log(error);
      res.send(error)
}))
}

function addMovie (req, res){
  console.log(req.body);
  let { title,myrate}=req.body

let sql = `INSERT INTO movietable (title,myrate) values($1,$2) RETURNING *;`;
let values = [ title,myrate];


client.query(sql,values).then((result)=>{
  return res.status(201).json(result.rows)

}).catch((error)=>{
  console.log(error);
})



}

function getMoviesData(req, res){
  let sql = `SELECT * FROM movietable;`;
  client.query(sql).then((result)=>{
    res.json(result.rows)
  }).catch((error)=>{
    console.log(error);
  })
}

function getSpicificMovie(req, res){
  let id = req.params.id
   

  let sql = `SELECT * FROM movietable WHERE id = ${id} ;`;
  client.query(sql).then((result)=>{
    res.json(result.rows)
  }).catch((error)=>{
    console.log(error);
  })
}

function deleteMovie(req, res){
  let id = req.params.id
  let sql = `DELETE FROM movietable WHERE id = ${id} RETURNING *;`;

  client.query(sql).then((result)=>{
    res.json(result.rows[0])
  }).catch((error)=>{
    console.log(error);
  })
}

function updateMovie (req, res){
    let id = req.params.id
    let { title,myrate}=req.body

    let sql = `UPDATE movietable SET title =$1, myrate =$2 WHERE id = ${id} RETURNING *;`;
    let values = [ title,myrate];


client.query(sql,values).then((result)=>{
  return res.status(201).json(result.rows)

}).catch((error)=>{
  console.log(error);
})

}



// constructors 
function FavMovie (title, poster_path, overview){
    this.title=title,
    this.poster_path=poster_path,
    this.overview=overview
}
function TrendMovie(id,title,release_date,poster_path,overview){
  this.id=id,
  this.title=title,
  this.release_date=release_date,
  this.poster_path=poster_path,
  this.overview=overview
}

function Genre(id,name){
  this.id=id,
  this.name=name
 
}


function Providers (id,name){
  this.id=id,
  this.name=name
 
}



client.connect().then(()=>{
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })
})