'use client';
import Button from '@mui/material/Button';
import Image from 'next/image';
import { gameAtoms } from "@/app/modules/gameAtoms";
import { useEffect, useRef, useState } from 'react';
import { loginAtom } from "@/app/modules/loginAtoms";
import { useRouter } from "next/navigation";
import { useAtom } from 'jotai';
import MyModal from '@/component/MyModal';
import Catch from '../catch/page';
import { tokenAtoms } from '@/app/modules/tokenAtoms';
import { answerAtom } from '../modules/answerAtom';
import { userInfoAtoms } from '../modules/userInfoAtom';
import { io } from "socket.io-client";
import {v4 as uuidv4} from 'uuid';
import { socketApi } from '../modules/socketApi';

export default function QR() {
    const [nowPeople, setNowPeople] = useState(0);
    const [gameInfo,] = useAtom(gameAtoms);
    const [userInfo,] = useAtom(userInfoAtoms);
    const gamePageUrl = `http://chltm.mooo.com:27017/player?id=${userInfo.id}`;
    const [isLogin,] = useAtom(loginAtom);
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [gameContent, setGameContent] = useState<JSX.Element>();
    const [token,] = useAtom(tokenAtoms);
    const [answer,setAnswer] = useAtom(answerAtom);
    const [uuId,] = useState<string>(uuidv4());
    const socket = useRef(io(`${socketApi}?uuId=${uuId}`,{
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
    }));

    useEffect(() => {
        if (!isLogin) {
            console.log(isLogin)
            alert('로그인이 필요합니다.')
            router.push("/")
        }

        socket.current.connect();

        socket.current.volatile.on("connect", () => {
            console.log("disconnect_check:", socket.current.connected);
            makeRoom();
        });


        socket.current.volatile.on("disconnect", () => {
            console.log("disconnect_check:", socket.current.connected);
        });

        if (gameInfo[0] === '그림 맞추기') {
            setGameContent(<Catch socket={socket.current}/>)
        } else if (gameInfo[0] === '무궁화 꽃이 피었습니다') {
            setGameContent(<Catch socket={socket.current}/>)
        } else if (gameInfo[0] === '줄넘기') {
            setGameContent(<Catch socket={socket.current}/>)
        }

        socket.current.on("start_catch_game", (response) => {
            console.log(response)
            if(response.result === true)
                setOpen(false);
            else
                alert(response.message)
        });

        socket.current.on('set_catch_answer', (res)=>{
            console.log(res)
            if(res.result === true){
                setAnswer(res.answer)
        }
        });

        socket.current.on('player_list_add', (res)=>{
            console.log(res)
            setNowPeople(res.player_cnt)
        });

        socket.current.on('player_list_remove', (res)=>{
            console.log(res)
            setNowPeople(res.player_cnt)
        });

        return () => {
            socket.current.emit('end_game',{
                room_id : userInfo.id,
             });
             socket.current.emit('leave_game',{
            });
            // handleBeforeUnload()
          };
    }, []);
    
    const makeRoom = () => {
        socket.current.emit('make_room', {
            game_type: gameInfo[0],
            user_num: gameInfo[1],
            answer: answer,
            access_token: token
        })
    }

    const startGame = () => {
        if (!answer) {
            alert('먼저 정답을 입력해주세요.')
            return
        }
        socket.current.emit('start_catch_game', {
            access_token: token
        });
    }

    const handleBeforeUnload = () => {
        socket.current.emit('end_game',{
            room_id : userInfo.id,
         });
         socket.current.emit('leave_game',{
        });

      };


    const QRpage = () => {
        return (
            <>
                <div className='qrPageCon'>
                    <h2>{gameInfo[0]}</h2>
                    <div className='QR-code'>
                        <Image src={`https://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=${gamePageUrl}`} alt="QR" layout='fill' unoptimized={true} />
                    </div>
                    <div className='online-number'>
                        <label>
                            <Image className="icon" src="/pngegg.png" alt="people" width={20} height={20} />
                        </label>
                        <p>{nowPeople} / {gameInfo[1]} 명</p>
                    </div>


                    <div className='gameInfo-start-button'>
                        <Button disabled={nowPeople === 0} onClick={startGame}>게임 시작</Button>
                    </div>
                </div>
                <style jsx>{`
            .qrPageCon{
                height: 70vh;
                display: flex;
                justify-content: space-evenly;
                align-items: center;
                flex-direction: column;
            }
            .QR-code{
                width: 20vw;
                height: 20vw;
                margin: 0 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .headers{
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .online-number{
                width: 250px;
                display: flex;
                align-items: center;
                justify-content: space-evenly;
            }
        `}</style>
            </>
        )
    }

    return (<>
        <MyModal open={open} modalHeader={"QR코드를 찍고 입장해주세요!"} modalContent={<QRpage />} closeFunc={() => { }} />
        {gameContent}
    </>)
}