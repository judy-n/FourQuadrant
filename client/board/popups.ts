// functions for Swal popups
import { checkPassword, protect, isProtected, updatePassword } from '../actions'
import Swal from 'sweetalert2'

export async function protectPopup(board_id: string) {
    try {
        const boardProtected = await isProtected(board_id)
        if (!boardProtected) {
            const result = await Swal.fire({
                title: "Protect Board",
                html: `
                    <input type="password" id="pass-input" class="swal2-input" placeholder="Password" style="font-family: Space Mono"/>
                `,
                confirmButtonColor: '#577399',
                confirmButtonText: `<span style="font-family: Space Mono">Protect</span>`,
                preConfirm: () => {
                    const passInput = Swal.getPopup().querySelector("#pass-input") as HTMLInputElement
                    const password = passInput.value
                    if (!password) {
                        Swal.showValidationMessage("Please enter a password")
                    }
                    return password
                }
            })
            
            if (result.isConfirmed) {
                const success = protect(board_id, result.value)
                if (success) {
                    Swal.fire({
                    icon: 'success',
                    title: 'Board Protected',
                    confirmButtonColor: '#577399',
                    confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
                    })
                } else {
                    Swal.fire({
                    icon: 'error',
                    title: 'Error Protecting Board',
                    })
                }
            }
        } else {
            const result = await Swal.fire({
                title: "Update Password",
                text: "This board is password protected",
                html: `
                    <input type="password" id="pass-input" class="swal2-input" placeholder="Password" style="font-family: Space Mono"/>
                    <input type="password" id="new-pass-input" class="swal2-input" placeholder="New Password" style="font-family: Space Mono"/>
                `,
                confirmButtonColor: '#577399',
                confirmButtonText: `<span style="font-family: Space Mono">Update</span>`,
                preConfirm: () => {
                    const oldPassInput = Swal.getPopup().querySelector("#pass-input") as HTMLInputElement
                    const newPassInput = Swal.getPopup().querySelector("#new-pass-input") as HTMLInputElement
                    const oldPassword = oldPassInput.value
                    const newPassword = newPassInput.value
                    if (!oldPassword || !newPassword) {
                    Swal.showValidationMessage("Please enter a value for password")
                    } else {
                    return { oldPassword, newPassword }
                    }
                },
                showDenyButton: true,
                denyButtonText: `<span style="font-family: Space Mono">Remove Password</span>`,
                preDeny: () => {
                    const oldPassInput = Swal.getPopup().querySelector("#pass-input") as HTMLInputElement
                    const oldPassword = oldPassInput.value
                    if (!oldPassword) {
                    Swal.showValidationMessage("Please enter your current password in the first box")
                    return false
                    } else {
                    return { oldPassword }
                    }
                },
                reverseButtons: true,
            })

            if (result.isConfirmed || result.isDenied) {
                let { oldPassword, newPassword } = result.value
                if (result.isDenied) {
                newPassword = ""
                }
                updatePassword(board_id, oldPassword, newPassword).then(success => {
                if (success) {
                    Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Password Updated',
                    confirmButtonColor: '#577399',
                    confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
                    })
                } else {
                    Swal.fire({
                    icon: 'error',
                    title: 'Error Updating Password',
                    })
                }
                })
            }
        }
    } catch (e) {
        console.error("Something went wrong", e)
    }
}

export async function openPopup() {
    const link = window.location.href;
    const result = await Swal.fire({
        title: "Share this board!",
        text: "Click the button to copy the link & share it with others!",
        html: '<input type="text" value="' + link + '" readonly size="60">',
        showCancelButton: true,
        confirmButtonColor: '#577399',
        confirmButtonText: `<span style="font-family: Space Mono">Copy Link</span>`,
        cancelButtonText: `<span style="font-family: Space Mono">Cancel</span>`,
    })

    if (result.isConfirmed) {
        navigator.clipboard.writeText(link);
        Swal.fire({
            title: "Copied!",
            icon: "success",
            confirmButtonColor: '#577399',
            confirmButtonText: `<span style="font-family: Space Mono">OK</span>`
        });
    }
}

export async function infoPopup() {
    Swal.fire({
        icon: "info",
        title: "About",
        iconColor: "#577399",
        showCloseButton: true,
        showConfirmButton: false,
        html: "FourQuadrant is an open-source program maintained and run by <a href=\"https://judyn.me\">Judy</a> and <a href=\"https://www.julienbl.me\">Julien</a>, two students at the University of Toronto.<br>Check out the source code on github and join our slack to chat with us!<br><br><a href=\"https://github.com/judy-n/FourQuadrant\" class=\"gh-btn\"><img class=\"brand-img\" src=\"../icons/GitHub-Mark-120px-plus.png\"><span class=\"brand-tt\">See our code!</span></img></a><a href=\"https://join.slack.com/t/fourquadrantworkspace/shared_invite/zt-138mkw6v6-1eraHaxQ~PTBQsGp59mJmQ\" class=\"gh-btn\"><img class=\"brand-img\" src=\"../icons/Slack_Mark_Web.png\"><span class=\"brand-tt\">Join our Slack!</span></img></a>"
    })
}