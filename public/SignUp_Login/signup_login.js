const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});



document.querySelector("#signup-form").addEventListener("submit", async (e) => {
	e.preventDefault();
  
	const name = document.querySelector("#signup-name").value;
	const email = document.querySelector("#signup-email").value;
	const password = document.querySelector("#signup-password").value;
  
	const response = await fetch("/signup", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({ name, email, password }),
	});
  
	if (response.status === 200) {
	  console.log("Signup successful");
	  // You can redirect the user or show a success message
	} else {
	  const data = await response.json();
	  console.error(data.message);
	}
  });
  
  document.querySelector("#login-form").addEventListener("submit", async (e) => {
	e.preventDefault();
  
	const email = document.querySelector("#login-email").value;
	const password = document.querySelector("#login-password").value;
  
	const response = await fetch("/login", {
	  method: "POST",
	  headers: { "Content-Type": "application/json" },
	  body: JSON.stringify({ email, password }),
	});
  
	if (response.status === 200) {
	  console.log("Login successful");
	  // You can redirect the user or show a success message
	} else {
	  const data = await response.json();
	  console.error(data.message);
	}
  });
  