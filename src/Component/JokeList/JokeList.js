import React, { Component } from 'react'
import './JokeList.css'
import axios from 'axios'
import uuid from 'uuid/dist/v4'
import Joke from '../Joke/Joke';

export default class JokeList extends Component {
    static defaultProps = {
        JokesToFetch : 10
    }

    constructor(props) {
        super(props);
        this.state = {
            jokes : JSON.parse(localStorage.getItem('jokes') || "[]"),
            loading : false
        }
        this.seenjokes = new Set(this.state.jokes.map(j => j.text))
    }
    
    componentDidMount(){
        if(this.state.jokes.length === 0)
            this.getJokes()           
    }

    async getJokes(){
       try {
        let jokes = []
        while(jokes.length < this.props.JokesToFetch){
            let res = await axios.get("https://icanhazdadjoke.com/",{
                headers : { Accept : "application/json" }
            })
            let newJoke = res.data.joke
            if(!this.seenjokes.has(newJoke))
                jokes.push({text : newJoke, votes : 0, id: uuid()})
        }
        this.setState(st => ({
            loading:false,
            jokes : [...st.jokes, ...jokes ]
        }),
        () => localStorage.setItem("jokes",JSON.stringify(this.state.jokes)))
       } catch (error) {
           this.setState({loading:false})
           alert(error.message)
       }
    }

    handleClick = () => {
        this.setState({loading:true},this.getJokes)
    }

    handleVote = (id, delta) => {
      this.setState(
          st => ({
              jokes : st.jokes.map( j =>  
                j.id === id ? {...j, votes: j.votes + delta} : j )
          }),
          () => localStorage.setItem("jokes",JSON.stringify(this.state.jokes))
      )
    }
    render() {
        if(this.state.loading){
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin" />
                    <h1 className="Jokelist-title" >Loading...</h1>
                </div>
            )
        }
        let jokes = this.state.jokes.sort((a,b) => b.votes - a.votes)
        return (
            <div className="JokeList">
                <div className="JokeList-sidebar">
                    <h1 className="JokeList-title">
                    <span>Dad</span> Jokes</h1>
                    <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="smiley" />
                    <button className="JokeList-getmore" onClick={this.handleClick}>New Joke</button>
                </div>
                
                <div className="JokeList-jokes">
                    {jokes.map(joke => 
                        <Joke 
                        key={joke.id} 
                        id={joke.id} 
                        text={joke.text} 
                        votes={joke.votes}
                        upvote={() => this.handleVote(joke.id,1)}
                        downvote={() => this.handleVote(joke.id,-1)}
                        /> 
                    )}
                </div>
            </div>
        )
    }
};
