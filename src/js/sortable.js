/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
export default class Sortable {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    this.element = element;
    this.sortableItems = [...this.element.querySelectorAll('.draggable')];
    this.activeDragElement = undefined;
    this.ghostEl = null;

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.newCardForm = this.newCardForm.bind(this);

    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('click', this.newCardForm);
  }

  render() {
    if (localStorage.length > 0) {
      Object.entries(localStorage).forEach((item) => {
        // what to insert
        const column = item[0];
        const text = item[1];
        // where to insert
        const columns = Array.from(this.element.querySelectorAll('.items'));
        const columnTo = columns.find((col) => columns.indexOf(col) === Number(column));
        // insert
        const el = document.createElement('div');
        el.className = 'items-item draggable';
        el.draggable = 'true';

        const txtEl = document.createElement('span');
        txtEl.innerText = text;

        const btn = document.createElement('div');
        btn.className = 'delete';
        btn.innerHTML = '&#x2715;';

        el.appendChild(txtEl);
        el.appendChild(btn);
        columnTo.insertBefore(el, columnTo.querySelector('.btn-add'));
      });
    }
  }

  onMouseDown(e) {
    if (e.which !== 1) { // если клик правой кнопкой мыши то он не запускает перенос
      return;
    }

    if (e.target.classList.contains('delete')) {
      this.toDelete(e);
      return;
    }

    if (e.target.classList.contains('btn-add')) {
      const column = e.target.closest('.items');
      column.querySelector('.btn-add').style.display = 'none';
      column.querySelector('.add-card').style.display = 'block';
      return;
    }

    if (!e.target.classList.contains('draggable')) return;

    const { target } = e;

    this.activeDragElement = target;

    // запомнить координаты клика
    this.activeDragElement.downX = e.pageX;
    this.activeDragElement.downY = e.pageY;

    // копия для переноса
    this.ghostEl = this.activeDragElement.cloneNode(true);
    this.ghostEl.classList.add('dragged');
    document.body.appendChild(this.ghostEl);
    this.activeDragElement.style.visibility = 'hidden';

    document.documentElement.addEventListener('mouseup', this.onMouseUp);
    document.documentElement.addEventListener('mousemove', this.onMouseMove);

    this.onMouseMove(e);
  }

  onMouseMove(e) {
    e.preventDefault();

    if (!this.activeDragElement) {
      return;
    }
    this.ghostEl.style.left = `${e.clientX + window.scrollX}px`;
    this.ghostEl.style.top = `${e.clientY + window.scrollY}px`;
  }

  onMouseUp(e) {
    if (this.activeDragElement) {
      const element = document.elementFromPoint(e.clientX, e.clientY);

      element.closest('.items').insertBefore(this.activeDragElement, element);
      this.activeDragElement.style.visibility = 'visible';
      this.activeDragElement = undefined;

      document.body.removeChild(this.ghostEl);
      this.ghostEl = null;
    }

    document.documentElement.removeEventListener('mouseup', this.onMouseUp);
    document.documentElement.removeEventListener('mousemove', this.onMouseMove);
  }

  toDelete(e) {
    const elToDelete = e.target.closest('.items-item');
    elToDelete.remove();
    // не удаляет из local storage
    localStorage.removeItem(Object.values(localStorage).find((value) => value === elToDelete.querySelector('span').innerText));
  }

  newCardForm(e) {
    e.preventDefault();

    const column = e.target.closest('.items');

    if (e.target.classList.contains('btn-add-card')) {
      const text = e.target.form[0].value;
      // add new card
      const el = document.createElement('div');
      el.className = 'items-item draggable';
      el.draggable = 'true';

      const txtEl = document.createElement('span');
      txtEl.innerText = text;

      const btn = document.createElement('div');
      btn.className = 'delete';
      btn.innerHTML = '&#x2715;';

      el.appendChild(txtEl);
      el.appendChild(btn);

      column.querySelector('.add-card').style.display = 'none';
      column.querySelector('.btn-add').style.display = 'block';
      column.insertBefore(el, column.querySelector('.btn-add'));

      // заменяет значения, что лучше использовать как ключ?
      const indexOfColumn = Array.from(this.element.querySelectorAll('.items')).findIndex((col) => col === e.target.closest('.items'));
      localStorage.setItem(indexOfColumn, text);
    }

    // cancel adding
    if (e.target.classList.contains('btn-cancel')) {
      e.target.form[0].value = '';
      column.querySelector('.btn-add').style.display = 'block';
      column.querySelector('.add-card').style.display = 'none';
    }
  }
}
