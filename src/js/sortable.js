/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import Item from './Item';

export default class Sortable {
  constructor(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    this.element = element;
    this.sortableItems = [...this.element.querySelectorAll('.draggable')];
    this.activeDragElement = undefined;
    this.ghostEl = null;
    this.state = {
      column1: [],
      column2: [],
      column3: [],
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.newCardForm = this.newCardForm.bind(this);

    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('click', this.newCardForm);
  }

  render() {
    this.state = JSON.parse(localStorage.getItem('state'));
    const columns = Array.from(this.element.querySelectorAll('.items'));

    if (localStorage.length > 0) {
      Object.entries(this.state).forEach((entrie) => {
        switch (entrie[0]) {
          case 'column1':
            entrie[1].forEach((item) => {
              const column = columns.find((col) => columns.indexOf(col) === 0);
              this.insertElement(item.value, column);
            });
            break;

          case 'column2':
            entrie[1].forEach((item) => {
              const column = columns.find((col) => columns.indexOf(col) === 1);
              this.insertElement(item.value, column);
            });
            break;

          case 'column3':
            entrie[1].forEach((item) => {
              const column = columns.find((col) => columns.indexOf(col) === 2);
              this.insertElement(item.value, column);
            });
            break;

          default:
            break;
        }
      });
    }
  }

  insertElement(value, column) {
    const el = document.createElement('div');
    el.className = 'items-item draggable';
    el.draggable = 'true';

    const txtEl = document.createElement('span');
    txtEl.innerText = value;

    const btn = document.createElement('div');
    btn.className = 'delete';
    btn.innerHTML = '&#x2715;';

    el.appendChild(txtEl);
    el.appendChild(btn);
    column.insertBefore(el, column.querySelector('.btn-add'));
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
    if (!this.activeDragElement) return;

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

    // удаление из local storage
    const indexOfColumn = Array.from(this.element.querySelectorAll('.items')).findIndex((col) => col === e.target.closest('.items'));
    switch (indexOfColumn) {
      case 0:
        this.state.column1.splice(this.state.column1.findIndex((item) => elToDelete.querySelector('span').innerText === item.value), 1);
        break;

      case 1:
        this.state.column2.splice(this.state.column2.findIndex((item) => elToDelete.querySelector('span').innerText === item.value), 1);
        break;

      case 2:
        this.state.column3.splice(this.state.column3.findIndex((item) => elToDelete.querySelector('span').innerText === item.value), 1);
        break;

      default:
        break;
    }

    localStorage.setItem('state', JSON.stringify(this.state));

    // удаление из DOM
    elToDelete.remove();
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
      e.target.form[0].value = '';
      column.querySelector('.btn-add').style.display = 'block';
      column.insertBefore(el, column.querySelector('.btn-add'));

      // сохранение в localStorage
      const item = new Item(text);

      const indexOfColumn = Array.from(this.element.querySelectorAll('.items')).findIndex((col) => col === e.target.closest('.items'));

      switch (indexOfColumn) {
        case 0:
          this.state.column1.push(item);
          break;

        case 1:
          this.state.column2.push(item);
          break;

        case 2:
          this.state.column3.push(item);
          break;

        default:
          break;
      }

      localStorage.setItem('state', JSON.stringify(this.state));
    }

    // cancel adding
    if (e.target.classList.contains('btn-cancel')) {
      e.target.form[0].value = '';
      column.querySelector('.btn-add').style.display = 'block';
      column.querySelector('.add-card').style.display = 'none';
    }
  }
}
