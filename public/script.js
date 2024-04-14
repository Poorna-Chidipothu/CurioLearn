const SignupLogin = document.getElementById('slbtn')
SignupLogin.addEventListener("click", () => {
    window.location.href='../SignUp_Login/signup_login.html';
});

const lightDark = document.querySelector('.light_dark');
lightDark.addEventListener('click',()=>{
    let body=document.body;
    let ldIcon = document.querySelector('.ld');
    body.classList.toggle("dark_mode");
    if(body.classList.contains("dark_mode")){
        ldIcon.name = 'sunny';
    }
    else{
        ldIcon.name = 'moon';
    }

})