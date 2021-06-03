import axios from 'axios'

export default class Search{
    constructor(){
        this.showHtml()
        this.enableSearchVisibility=document.querySelector(".search-overlay")
        this.disableSearchVisibility=document.querySelector(".close-live-search")
        this.getButtonClicked=document.querySelector(".header-search-icon")
        this.focusOnwhenClicked=document.querySelector("#live-search-field")
        this.DefaultSearch=document.querySelector(".live-search-results")
        this.circleLoader=document.querySelector(".circle-loader")
        this.typingWaitTimer
        this.previousValue=""
        this.events()
    }

   

    events(){
        this.focusOnwhenClicked.addEventListener("keyup",()=>{
            this.keyPressed()
        })

        this.disableSearchVisibility.addEventListener("click",()=>{
            this.closeOverlay()
        })

        this.getButtonClicked.addEventListener("click",(e)=>{
            e.preventDefault()
            this.Openoverlay()
            
            //this.showHtml()
        })

    }

    keyPressed(){
        console.log("keypressed clicked")
        let value=this.focusOnwhenClicked.value
        console.log(value)
        if(value=="")
        {
            clearTimeout(this.typingWaitTimer)
            this.clearLoaderIcon()
            this.clearResultArea()
        }
        if(value!="" && value!=this.previousValue){
           clearTimeout(this.typingWaitTimer)
            this.loaderIcon()
            this.clearResultArea()
            this.typingWaitTimer=setTimeout(() => this.sendRequest() , 750);
        }
        this.previousValue=value
    }

    sendRequest(){
        axios.post('/search',{searchedTerm:this.focusOnwhenClicked.value}).then((response)=>{
            console.log(response.data)
            this.renderHTML(response.data)
        }).catch(()=>{
            console.log("Error")
        })
        
    }

    clearLoaderIcon(){
        this.circleLoader.classList.remove("circle-loader--visible")
    }

    loaderIcon(){
        this.circleLoader.classList.add("circle-loader--visible")
    }

    renderHTML(post){
        console.log(post.length)
        if(post.length){
            this.DefaultSearch.innerHTML=`<div class="list-group shadow-sm">
            
            <div class="list-group-item active"><strong>Search Results</strong> (${post.length>1 ?`${post.length} posts found`:`${post.length} post found`})</div>
            ${post.map(function(x){
                let postDate= new Date(x.CreatedDate)
                return `<a href="/post/${x._id}" class="list-group-item list-group-item-action">
              <img class="avatar-tiny" src="${x.author.avatar}"> <strong>${x.title}</strong>
              <span class="text-muted small">by ${x.author.username} on ${postDate.getMonth()+1}/${postDate.getDate()}/${postDate.getFullYear()}</span>
            </a>`
        }).join('')}
        </div>`
        }
        else{
            this.DefaultSearch.innerHTML=`<p class="alert alert-danger text-center shadow-sm">No result Found</p>`
        }
        this.clearLoaderIcon()
        this.showResultArea()

    }

    showResultArea(){
        this.DefaultSearch.classList.add('live-search-results--visible')

    }
    clearResultArea(){
        this.DefaultSearch.classList.remove('live-search-results--visible')

    }

    Openoverlay(){
        this.enableSearchVisibility.classList.add("search-overlay--visible")
        setTimeout(()=> this.focusOnwhenClicked.focus(),30) 
    }
    closeOverlay(){
        this.enableSearchVisibility.classList.remove("search-overlay--visible")
    }
    
    showHtml(){
        document.body.insertAdjacentHTML('beforeend',`
        <div class="search-overlay">
    <div class="search-overlay-top shadow-sm">
      <div class="container container--narrow">
        <label for="live-search-field" class="search-overlay-icon"><i class="fas fa-search"></i></label>
        <input type="text" id="live-search-field" class="live-search-field" placeholder="What are you interested in?">
        <span class="close-live-search"><i class="fas fa-times-circle"></i></span>
      </div>
    </div>

    <div class="search-overlay-bottom">
      <div class="container container--narrow py-3">
        <div class="circle-loader"></div>
        <div class="live-search-results"> </div>
      </div>
    </div>
  </div>
        `)
    }


}