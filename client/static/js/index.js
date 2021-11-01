'use strict'

const newBoard = async () => {
  try {
    const board = await createBoard()
    if (board) {
      setTimeout(() => {
        window.location.href = `/${board._id}`
      }, 1500)
    } else {
      console.log('could not create board')
    }
  } catch (e) {
    console.log('unknown error')
  }
}

$(".cta").click(function(){
  $(this).addClass("active").delay(300).queue(function(next){
    $(this).removeClass("active");
    next();
  });
});