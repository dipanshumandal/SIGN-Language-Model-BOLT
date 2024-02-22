const APP_ID="e0529f004de449aca9dd77f5184c8e51"
const TOKEN="007eJxTYJDQXHYj+N3/Tb/iA9563aspubLJkfOefej7fnOet8wRhpEKDJaWacZpFiYGxuapliaWFolJaabGhhbGFgamRuYmpiaWQq+vpTYEMjKciRFlYmSAQBCfhSE3MTOPgQEAbXAfAA==" 
const CHANNEL="main"

const client=AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks=[]
let remoteUsers={} 

let joinAndDisplayLocalStream = async ()=> {

    client.on('user-published', handleUserJoined)

    client.on('user-left',handleUserLeft)

    let UID =  await client.join(APP_ID, CHANNEL, TOKEN, null)
 
    localTracks= await AgoraRTC.createMicrophoneAndCameraTracks()

    let player=`<div class="video-container" id="user-container-${UID}">
        <div class="video-player" id="user-${UID}"></div>
    </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend',player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0],localTracks[1] ])
}

let joinStream=async () => {
    console.log("fcvyyt")
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    console.log("abc")
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft=async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream= async()=>{
    for(let i=0; localTracks.length>i;i++){
        localTracks[i].stop()
        localTracks[i].close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display='block'
    document.getElementById('stream-controls').style.display='none'
    document.getElementById('video-streams').innerHTML=''
    const boxes = document.querySelectorAll('.video-container');

    boxes.forEach(box => {
        box.style.border='none';
    });
}

let toggleMic=async(e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText='Mic On'
        e.target.style.backgroundColor='cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText='Mic Off'
        e.target.style.backgroundColor='white'
    }
}

// let toggleCamera =async (e) =>{
//     if(localTracksp[1].muted)
// }

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click',leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click',toggleMic)