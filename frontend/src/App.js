import React from "react";
import * as Components from "./Components";
import Typewriter from "typewriter-effect";
import hammerGif from "./assets/hammer.gif";

function App() {
    const [signIn, toggle] = React.useState(true);

    return (
        <Components.Container>
            {/* Sign Up Section */}
            <Components.SignUpContainer signinIn={signIn}>
                <Components.Form>
                    <Components.Title>Create Account</Components.Title>
                    <Components.Input type="text" placeholder="Name" />
                    <Components.Input type="email" placeholder="Email" />
                    <Components.Input type="password" placeholder="Password" />
                    <Components.Button>Sign Up</Components.Button>
                </Components.Form>
            </Components.SignUpContainer>

            {/* Sign In Section */}
            <Components.SignInContainer signinIn={signIn}>
                <Components.Form>
                    <Components.Title>Sign in</Components.Title>
                    <Components.Input type="email" placeholder="Email" />
                    <Components.Input type="password" placeholder="Password" />
                    <Components.Anchor href="#">Forgot your password?</Components.Anchor>
                    <Components.Button>Sign In</Components.Button>
                </Components.Form>
            </Components.SignInContainer>

            {/* Overlay Container */}
            <Components.OverlayContainer signinIn={signIn}>
                <Components.Overlay signinIn={signIn}>

                    {/* Left Overlay Panel (Welcome Back) */}
                    <Components.LeftOverlayPanel signinIn={signIn}>
                        <Components.Title>
                            <Typewriter
                                options={{
                                    strings: ["Welcome Back Biddr!"],
                                    autoStart: true,
                                    loop: true,
                                    delay: 100,
                                }}
                            />
                        </Components.Title>
                        <img src={hammerGif} alt="Hammer GIF" style={{ width: "80px", marginTop: "10px" }} />
                        <Components.GhostButton onClick={() => toggle(true)}>
                            Sign In
                        </Components.GhostButton>
                    </Components.LeftOverlayPanel>

                    {/* Right Overlay Panel (Hello Biddr) */}
                    <Components.RightOverlayPanel signinIn={signIn}>
                        <Components.Title>
                            <Typewriter
                                options={{
                                    strings: ["Hello, Biddr!"],
                                    autoStart: true,
                                    loop: true,
                                    delay: 100,
                                }}
                            />
                        </Components.Title>
                        <img src={hammerGif} alt="Hammer GIF" style={{ width: "80px", marginTop: "10px" }} />
                        <Components.GhostButton onClick={() => toggle(false)}>
                            Sign Up
                        </Components.GhostButton>
                    </Components.RightOverlayPanel>

                </Components.Overlay>
            </Components.OverlayContainer>
        </Components.Container>
    );
}

export default App;
