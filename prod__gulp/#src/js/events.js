
window.addEventListener('DOMContentLoaded', () => {
   document.addEventListener('click', (e) => {
      documentActions(e)
   })
   let documentActions = (e) => {
      let eventsTarget = e.target;
      if (window.innerWidth > 768) {
         if (eventsTarget.classList.contains('header__main-btn')) {
            eventsTarget.parentNode.classList.toggle('_hover');
         }
         if (!eventsTarget.classList.contains('header__main-btn') && document.querySelectorAll('.header__main-item._hover').length > 0) {
            document.querySelectorAll('.header__main-item').forEach((item) => {
               item.classList.remove('_hover')
            })
         }
      }
   }
})