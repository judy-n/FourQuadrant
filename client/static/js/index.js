'use strict'

const newBoard = async () => {
  try {
    const board = await createBoard()
    if (board) {
      window.location.href = `/${board._id}`
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