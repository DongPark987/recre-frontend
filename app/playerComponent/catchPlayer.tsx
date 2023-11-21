import { Button } from "@mui/material";
import { useState } from "react";
import { Socket } from "socket.io-client";

export default function CatchPlayer({roomId, socket} : {roomId : string, socket : Socket}) {
    const [playerAnswer, setPlayerAnswer] = useState<string>('');

    const leave_game = () => {
        socket.emit("leave_game", {
        });
    }

    const throwCatchAnswer = () => {
        socket.emit("throw_catch_answer", {
            room_id: roomId,
            ans: playerAnswer,
        })
    }

    return (<>
         <label className="answer-label">정답: </label>
                <input 
                    type="text" 
                    className="catch-answer-input"
                    value={playerAnswer} 
                    onChange={(e)=>setPlayerAnswer(e.target.value)}></input>
                <Button className="throw-answer" onClick={throwCatchAnswer} >제출</Button>
        <Button onClick={leave_game}>leave game</Button></>)
}