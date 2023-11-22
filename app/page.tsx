"use client";
import * as React from 'react';
import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';
import { useAtom } from 'jotai';
import { loginAtom } from "@/app/modules/loginAtoms";
import { tokenAtoms } from './modules/tokenAtoms';
import { userInfoAtoms } from './modules/userInfoAtom';
import axios from 'axios';
import { useEffect } from 'react';
import { useCookies } from 'next-client-cookies';
import { myApi } from './modules/backApi';
import { gameAtoms } from './modules/gameAtoms';
import { loginTryNumAtom } from './modules/loginTryNumAtom';


export default function Home() {
  const [isLogin, setIsLogin] = useAtom(loginAtom)
  const [token, setToken] = useAtom(tokenAtoms);
  const [, setUserInfo] = useAtom(userInfoAtoms);
  const [, setGame] = useAtom(gameAtoms);
  const [loginTryNum, setLoginTryNum] = useAtom(loginTryNumAtom);
  const router = useRouter();
  const cookies = useCookies();

  useEffect(() => {
    if(!cookies.get('refresh_token'))
      return
    const acc_token : string = localStorage.getItem('access_token')??''
    console.log("acc_token: ")
    console.log(acc_token)
    if(loginTryNum > 10){
      alert('로그인 할 수 없습니다. 관리자에게 문의하세요.')
    }
    else {
      setLoginTryNum((loginTryNum) =>{return loginTryNum + 1});
      checkLogin(acc_token)
    }
  }, []);

  const selectGame = () => {
    if (isLogin) {
      router.push("/gameSelect");
    } else {
      alert('로그인이 필요합니다.')
    }
  }

  const checkLogin = (acc_token : string) => {
    axios.get(`${myApi}/user`, {
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        'authorization': acc_token,
        withCredentials: true
      }
    }).then((response) => {
      console.log("checkLogin")
      setUserInfo(response.data)
      setIsLogin(true)
      checkIsHostPhone()
    })
      .catch((res) => {
        console.log(res)
        console.log("checkLogin error")
        if (res.response['status'] == 410 || res.response['status'] == 401) {
          sendRefresh()
        }
        else {
          alert(res)
          setToken('');
        setUserInfo({
            id: '',
            nickname: '',
            email: '',
            profileImage: '',
            provider: '',
        });
        cookies.remove('refresh_token')
        setIsLogin(false);
        setGame(["",null])
        }
      })
  }

  const sendRefresh = () => { //customHook 으로 만들어서 모든 요청에 대한 에러 핸들링으로 써야 함
    axios.post(`${myApi}/auth/accesstoken`, {
      refresh_token: cookies.get('refresh_token')
    }, {
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json',
        withCredentials: true
      }
    }).then((response) => {
      console.log("sendRefresh")
      console.log("response.data.access_token: ")
      console.log(response.data.access_token)
      setToken(response.data.access_token)
      checkLogin(response.data.access_token)
    })
      .catch((res) => {
        console.log("sendRefresh error")
        alert('인증 시간이 만료되었습니다. 다시 로그인해주세요.')
        setToken('');
        setUserInfo({
            id: '',
            nickname: '',
            email: '',
            profileImage: '',
            provider: '',
        });
        cookies.remove('refresh_token')
        setIsLogin(false);
        setGame(["",null])
        router.push("/")
      })
  }

  const checkIsHostPhone = () => {
    let isHostPhone = localStorage.getItem('isHostPhone');
    if(isHostPhone === 'true'){
      router.push("/catchAnswer");
    }
  }


  return (<>
    <div className='container'>
      <div>
        <p className='middleLogo'>RecRe</p>
      </div>
      {/* login시에만 보이는 버튼 */}
      <div className="login">
        <Button className='start-button' onClick={selectGame}>RecRe 시작!</Button>
      </div>
    </div>
    <style jsx>{`
            .container{
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                height: 100vh;
            }
            .middleLogo{
              font-size: 10vw;
              background: #f1f1f1;
              padding: 50px;
              box-shadow: 0 0 10px rgba(0,0,0,0.5);
            }
            .middleLogo:hover{
              scale: 1.1;
              rotate: 10deg;
              cursor: pointer;
              color: gray;
            }
        `}</style>
  </>
  )
}
