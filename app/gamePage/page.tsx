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
import { v4 as uuidv4 } from 'uuid';
import { socketApi } from '../modules/socketApi';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { access } from 'fs';

export default function QR() {
    const [nowPeople, setNowPeople] = useState(0);
    const [gameInfo, setGameInfo] = useAtom(gameAtoms);
    const [userInfo,] = useAtom(userInfoAtoms);
    //.env로 수정해야 함
    const gamePageUrl = `http://chltm.mooo.com:27017/player?id=${userInfo.id}`;
    const [isLogin,] = useAtom(loginAtom);
    const router = useRouter();
    const [open, setOpen] = useState(true);
    const [gameContent, setGameContent] = useState<JSX.Element>();
    const [token,] = useAtom(tokenAtoms);
    const [answer, setAnswer] = useAtom(answerAtom);
    const [uuId,] = useState<string>(uuidv4());
    const socket = useRef(io(`${socketApi}?uuId=${uuId}`, {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: false,
    }));
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    //.env로 수정해야 함
    const gamePageUrlAns = `http://chltm.mooo.com:27017/catchAnswer`;

    useEffect(() => {
        if (!isLogin) {
            // console.log(isLogin)
            alert('로그인이 필요합니다.')
            router.push("/")
        }

        socket.current.connect();

        socket.current.volatile.on("connect", () => {
            // console.log("disconnect_check:", socket.current.connected);
            makeRoom(localStorage.getItem('access_token')??'' as string);
        });


        socket.current.volatile.on("disconnect", () => {
            // console.log("disconnect_check:", socket.current.connected);
        });

        if (JSON.parse(localStorage.getItem('game') || 'null')[0] === '그림 맞추기') {
            setGameContent(<Catch socket={socket.current} />)
        } else if (JSON.parse(localStorage.getItem('game') || 'null')[0] === '무궁화 꽃이 피었습니다') {
            setGameContent(<Catch socket={socket.current} />)
        } else if (JSON.parse(localStorage.getItem('game') || 'null')[0] === '줄넘기') {
            setGameContent(<Catch socket={socket.current} />)
        }

        socket.current.on("start_catch_game", (response) => {
            // console.log(response)
            if(response.result === true)
                setOpen(false);
            else
                alert(response.message)
        });
        //이 소켓은 필요없는 것 같음(catchAnswer와 중복된 소켓)
        socket.current.on('set_catch_answer', (res)=>{
            // console.log(res)
            if(res.result === true){
                setAnswer(res.answer)
            }
        });

        socket.current.on('player_list_add', (res)=>{
            // console.log(res)
            setNowPeople(res.player_cnt)
        });

        socket.current.on('player_list_remove', (res)=>{
            // console.log(res)
            setNowPeople(res.player_cnt)
        });

        // socket.current.on('player_list_add', (res)=>{
        //     console.log(res)
        //     let recieved_people = res.player_cnt
        //     setNowPeople(recieved_people)
        //     socket.current.emit('player_list_add_check', {
        //         cur_num : recieved_people,
        // })
        // });

        // socket.current.on('player_list_remove', (res)=>{
        //     console.log(res)
        //     let recieved_people = res.player_cnt
        //     setNowPeople(recieved_people)
        //     socket.current.emit('player_list_add_check', {
        //         cur_num : recieved_people,
        // })


        return () => { 
            handleBeforeUnload();
        };
    }, []);

        const makeRoom = (acc_token: string) => {
            const game_t = JSON.parse(localStorage.getItem('game') || 'null');
            socket.current.emit('make_room', {
                game_type: game_t[0],
                user_num: game_t[1],
                answer: answer,
                access_token: acc_token
            });
        };

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
            socket.current.emit('end_game', {
                room_id: userInfo.id,
            });

        };


        const handlePopover = (event: React.MouseEvent<HTMLDivElement>) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        const openPopover = Boolean(anchorEl);
        const id = openPopover ? 'simple-popover' : undefined;

        const testGame = () => {
            setGameInfo(['그림 맞추기', 1])
            socket.current.emit("throw_catch_answer", {
                room_id: userInfo.id,
                ans: 'test',
            })
            socket.current.emit('start_catch_game', {
                access_token: token
            });
        }


        const QRpage = () => {
            return (
                <>
                    <div className='qrPageCon'>
                        <h2>{JSON.parse(localStorage.getItem('game') || 'null')[0]}</h2>
                        {/* 게임 종류가 catch mind인 경우 */}
                        {JSON.parse(localStorage.getItem('game') || 'null')[0] === '그림 맞추기' ?
                            <div className='alertSt'><Alert severity="info" onClick={handlePopover}>
                                <AlertTitle>정답을 입력해주세요</AlertTitle>
                                호스트는 이 창을 클릭하여 QR을 찍고 문제의 정답을 입력해 주세요. <strong>로그인 된 호스트만</strong> 정답을 입력할 수 있습니다.
                            </Alert><Popover
                                id={id}
                                open={openPopover}
                                anchorEl={anchorEl}
                                onClose={handleClose}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                    <div className='QR-code-ans'>
                                        <Image src={`https://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=${gamePageUrlAns}`} alt="QR" layout='fill' unoptimized={true} />
                                    </div>
                                </Popover></div> : <></>}
                        <div className='QR-code'>
                            <Image src={`https://chart.apis.google.com/chart?cht=qr&chs=250x250&chl=${gamePageUrl}`} alt="QR" layout='fill' unoptimized={true} />
                        </div>
                        <div className='online-number'>
                            <label className="icon">
                                <Image src="/pngegg.png" alt="people" width={20} height={20} />
                            </label>
                            <h3>{nowPeople} / {gameInfo[1]} 명</h3>
                        </div>


                        <div className='gameInfo-start-button'>
                            <Button disabled={nowPeople === 0} onClick={startGame}>게임 시작</Button>
                            <Button onClick={testGame}>Test</Button>
                        </div>
                    </div>
                    <style jsx>{`
            .qrPageCon{
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
                margin-bottom: 10px;
            }
            .headers{
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }
            .online-number{
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                gap: 10px;
            }
            .alertSt{
                cursor: pointer;
                border: 1px solid transparent;
                margin-bottom: 15px;
            }
            .alertSt:hover{
                border: 1px solid blue;
            }
            .QR-code-ans{
                width: 10vw;
                height: 10vw;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .icon{
                position: relative; 
                top: 3px;
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