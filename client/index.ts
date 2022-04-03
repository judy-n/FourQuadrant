'use strict'
// scripts needed
import { createBoard } from "./actions"
import "./js/granim-script"

const newBoard = async () => {
  try {
    const board = await createBoard()
    if (board) {
      setTimeout(() => {
        //@ts-ignore
        if (import.meta.env.MODE === "development") {
          sessionStorage.setItem("__dev_boardId", board._id.toString())
          window.location.href = "/board/"
        } else {
          window.location.href = `/${board._id}`
        }
      }, 1500)
    } else {
      console.log('could not create board')
    }
  } catch (e) {
    console.log('unknown error', e)
  }
}

document.querySelector(".cta").addEventListener("click", function(this: HTMLButtonElement) {
  this.classList.add("active")
  setTimeout(() => {
    this.classList.remove("active")
    newBoard()
  }, 3000)
})