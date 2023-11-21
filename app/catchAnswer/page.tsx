"use client"
import Button from '@mui/material/Button';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { userInfoAtoms } from "@/app/modules/userInfoAtom";
import { tokenAtoms } from '../modules/tokenAtoms';
// import { socket } from '../modules/socket';
import { answerAtom } from '../modules/answerAtom';
import OauthButtons from '@/component/OauthButtons';
import { loginAtom } from '../modules/loginAtoms';
import {v4 as uuidv4} from 'uuid';
import { socketApi } from '../modules/socketApi';


export default function CatchAnswer() {
    const [userInfo,] = useAtom(userInfoAtoms);
    const [catchAnswer, setCatchAnswer] = useState<string>('');
    const [token,] = useAtom(tokenAtoms);
    const [,setAnswer] = useAtom(answerAtom);
    const [isLogin,] = useAtom(loginAtom);
    const [inpUnAvailable, setInpUnAvailable] = useState<boolean>(false);
    const [uuId,] = useState<string>(uuidv4());
    const socket = useRef(io(`${socketApi}?uuId=${uuId}`,{
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
    }));

    useEffect(()=>{
        localStorage.setItem('isHostPhone','true')

        socket.current.on("set_catch_answer", (res)=>{
            if(res.result === true){
                alert('정답이 설정되었습니다.')
                setInpUnAvailable(true)
            } else{
                alert('아직 방이 안 만들어졌습니다.')
            }
        });

        socket.current.on("disconnect", ()=>{
                alert('게임이 종료되었습니다.')
                setInpUnAvailable(false)
        })

        return () => {
            handleBeforeUnload()
        };
    },[])

    const handleBeforeUnload = () => {
        socket.current.disconnect()
     };


    const handleAnswerSubmit = () => {
        socket.current.connect();
        setAnswer(catchAnswer)
        socket.current.emit("set_catch_answer", { room_id : userInfo.id , ans : catchAnswer , access_token : token });
        console.log("catchAnswer",catchAnswer)
    }

    return (
        <>
        {isLogin? <><label>정답입력</label>
                <input
                    type="text"
                    className="catchAnswer-input"
                    value={catchAnswer}
                    onChange={(e) => setCatchAnswer(e.target.value)}
                    disabled={inpUnAvailable}></input>
                <Button onClick={handleAnswerSubmit} disabled={inpUnAvailable}>제출</Button></>:<OauthButtons/>}
        </>
    )
}