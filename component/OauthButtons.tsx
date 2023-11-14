import Image from "next/image"
import oauthButtonsStyle from "./oauthButtonsStyle.module.css"
import axios from "axios"

export default function OauthButtons({onLogin}:{onLogin:()=>void}) {

    const login = (method:string) => {
        axios.get(`http://treepark.shop:3000/auth/${method}`, {
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                withCredentials: true
            }
        }).then((Response) => {
                alert('로그인 되었습니다.')
                onLogin()
            })
            .catch((res) => { 
                alert(res.response.data.message) 
                onLogin() //임시로 로그인 확인을 위해. 나중에 지울 것.
            })
    }

    return (<><div className={oauthButtonsStyle.imgDiv}>
        <Image src={"/oauth/kakao_login.png"} alt={"카카오 로그인 이미지"} sizes="100vw" width={0} height={0} className={oauthButtonsStyle.img} onClick={(e)=>login('kakao')}/>
        <Image src={"/oauth/naver_login.png"} alt={"네이버 로그인 이미지"} sizes="100vw" width={0} height={0} className={oauthButtonsStyle.img} onClick={(e)=>login('naver')}/>
        <div className={[oauthButtonsStyle.google_btn, oauthButtonsStyle.img].join(" ")} onClick={(e)=>login('google')}>
            <div className={oauthButtonsStyle.google_icon_wrapper}>
                <img className={oauthButtonsStyle.google_icon_svg} src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" />
            </div>
            <p className={oauthButtonsStyle.btn_text}><b>구글 로그인</b></p>
        </div>
    </div>
        </>
    )
}