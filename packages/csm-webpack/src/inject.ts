const body = document.getElementsByName('body')[0]
const port = 3000
const div = document.createElement('div')
div.setAttribute('id', 'csm_service__btn')

div.innerHTML = `
<svg class="csm_service__btn__close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="feather feather-x">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
<svg class="csm_service__btn__open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
  class="feather feather-box">
  <path
    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z">
  </path>
  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
  <line x1="12" y1="22.08" x2="12" y2="12"></line>
</svg>
<style>
  #csm_service__btn {
    position: fixed;
    bottom: 5%;
    right: 5%;
    z-index: 9999;
    padding: 10px;
    background: rgba(0, 0, 0, 0.09);
    border-radius: 50%;
    cursor: pointer;
  }
  #csm_service__btn svg {
    display:block;
  }
  #csm_service__btn iframe,
  #csm_service__btn .csm_service__btn__close {
    display: none;
  }

  #csm_service__btn.show .csm_service__btn__open {
    display: none;
  }

  #csm_service__btn.show .csm_service__btn__close {
    display: block;
  }

  #csm_service__btn.show iframe {

    display: block;
    position: fixed;
    top: 5%;
    width: 70%;
    max-width: 1280px;
    margin: auto;
    margin: auto;
    left: 0;
    right: 0;
    height: 80%;
    box-shadow: 0 5px 12px 4px rgba(0, 0, 0, 0.09);
  }
</style>
<iframe src="//localhost:${port}" frameborder="0"></iframe>
<script>
  var open = document.getElementsByClassName('csm_service__btn__open')[0]
  var close = document.getElementsByClassName('csm_service__btn__close')[0]
  open.addEventListener('click', function (e) {
    this.parentElement.setAttribute('class', 'show')
  })
  close.addEventListener('click', function () {
    this.parentElement.setAttribute('class', '')
  })
</script>
`

body.appendChild(div)
