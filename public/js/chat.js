const socket = io()

// Elements
const $form = document.querySelector("#message-form");
const $messageFormInput = $form.querySelector("input");
const $messageFormButton = $form.querySelector("button");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessage = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML
// Options

  const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

//  IMPORTANT!!!
const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild
    
    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height

    const visibleHeight = $messages.offsetHeight

    // height of messages container

    const containerHeight = $messages.scrollHeight;
    
    // how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
            $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on("message", (message) => {
    
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html);
    autoScroll()
})

socket.on("locationMessage", (message) => {
    console.log(message)
    const html = Mustache.render(locationMessage, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoScroll()
})


socket.on("roomData", ({room, users}) => {
    
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})



$form.addEventListener("submit", (e) => {
   // disable
    e.preventDefault()

    $messageFormButton.setAttribute("disabled", "disabled")

    const message = document.querySelector("input").value;
    
    socket.emit("sendMessage", message, (error) => {
      // enable
      $messageFormButton.removeAttribute("disabled");
      $messageFormInput.value = "";
      $messageFormInput.focus()
      
      
        if(error){
            return console.log(error)
        }
        console.log("Message delivered")
    })
})

const $location = document.querySelector("#send-location");
$location.addEventListener("click", () => {
    
    if(!navigator.geolocation){
        return alert("Geolocation is not supported")
    }
    $location.setAttribute("disabled", "disabled");
    
    navigator.geolocation.getCurrentPosition((position) => {
            socket.emit("sendLocation", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                $location.removeAttribute("disabled")
                console.log("Location shared!")
            })
    })
})

socket.emit("join", {username, room}, (error) => {
    if(error){
        alert(error);
        location.href = "/"
    }
})