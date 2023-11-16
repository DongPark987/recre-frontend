import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { userInfoAtoms } from '../modules/userInfoAtom';
import axios from 'axios';

export default function Profile() {
    const [nickname, setNickname] = useState<string>('');
    const [userInfo, setUserInfo] = useAtom(userInfoAtoms);
    const [nickChange, setNickChange] = useState<boolean>(false);

    // //토큰(세션?)에서 현재 사용자의 nickname을 가져와야 함 (임시로 작성함)
    // const getNicknameFromToken = (token: string): string => {
    //     // const tokenPayload = token.split('.')[1];
    //     // const decodedTokenPayload = atob(tokenPayload);
    //     // const nickname = JSON.parse(decodedTokenPayload).nickname;
    //     // return nickname;
    // }

    // const [currentNickname, setNickname] = useState<string>(getNicknameFromToken("token"));
    // const [newNickname, setNewNickname] = useState<string | null>(null);

    // //DB에 PUT(PATCH?) 요청을 보내는 닉네임 변경 함수 (임시로 작성함)
    // const handleNicknameChange =  async() => {
    //     if (newNickname === null) {
    //         alert("변경할 닉네임을 입력해주세요.");
    //         return;
    //     } else if (newNickname === currentNickname) {
    //         alert("기존 닉네임과 동일합니다.");
    //         return;
    //     } else if (currentNickname) {
    //         try {
    //             const response = await axios.put("http://treepark.shop:3000/user/change", {
    //                 nickname: newNickname,
    //             }, {
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "Accept": "application/json",
    //                     withCredentials: true
    //                 }
    //             });

    //             if (response.status === 200) {
    //                 alert("닉네임이 변경되었습니다.");
    //                 setNickname(newNickname);
    //             }
    //         } catch (err) {
    //             console.log(err);
    //         }

    //     }

    // }
    // //DB에 DELETE 요청을 보내는 회원탈퇴 함수 (임시로 작성함)
    // const handleWithdrawal = async () => {
    //     if (currentNickname) {
    //         if (confirm("정말로 탈퇴하시겠습니까?") === false) {
    //             return;
    //         } else {
    //             const response = await axios.delete("http://treepark.shop:3000/user/withdrawal", {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "Accept": "application/json",
    //             },
    //             data: {
    //                 nickname: currentNickname,
    //             }
    //             });
    //             alert("회원 탈퇴가 완료되었습니다.");
    //         }
    //     }
    // };
    // //현재 토큰(세션?)을 지우는 로그아웃 함수
    // const handleLogout = () => {

    // }

    return (<>
        <div className='textGroup'>
            {/* <h1>{currentNickname || "사용자" } 님의 프로필</h1> */}
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '30ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <div className='nickDiv'><TextField id="outlined-nick" variant="standard" value={`닉네임 : ${userInfo.nickname}`} disabled={!nickChange}/> 
                {nickChange?<><Button>변경</Button><Button onClick={()=>setNickChange(!nickChange)}>취소</Button></>:<Button onClick={()=>setNickChange(!nickChange)}>변경</Button>}</div>
            </Box>
            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '30ch' },
                }}
                noValidate
                autoComplete="off"
            >
                <TextField id="outlined-basic" variant="standard" value={`이메일 : ${userInfo.email}`} disabled/>
                <TextField id="outlined-basic" variant="standard" value={`공급자 : ${userInfo.provider}`} disabled/>
            </Box>
            <div>
                <Button className="withdrawl">회원 탈퇴</Button>
                <Button className="logout">로그아웃</Button>
            </div>

            {/* <Button onClick={handleNicknameChange}>변경하기</Button>
            <Button onClick={handleWithdrawal}>회원 탈퇴</Button>
            <Button onClick={handleLogout}>로그아웃</Button> */}
        </div>
        <style jsx>{`
            .textGroup{
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                width: 350px;
            }
            .nickDiv{
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
            }
        `}</style>
        </>
    )
}