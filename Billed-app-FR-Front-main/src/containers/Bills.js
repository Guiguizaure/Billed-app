import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class Bills {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    // Set up event listeners
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`);
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill);

    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon));
    });

    // Initialize Logout component
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill']);
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($('#modaleFile').width() * 0.4);
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`);
    $('#modaleFile').modal('show');
  }

  getBills = () => {
    if (this.store) {
      return this.store
        .bills().list().then(snapshot => {
            // Sort bills by date in descending order
            const bills = snapshot.sort((a, b) => (new Date(b.date) - new Date(a.date)))
              .map(doc => {
                try {
                  return {
                    ...doc,
                    date: formatDate(doc.date),
                    status: formatStatus(doc.status)
                  };
                } catch (e) {
                  // Handle potential errors in formatting
                  console.log(e, 'for', doc);
                  return {
                    ...doc,
                    date: doc.date,
                    status: formatStatus(doc.status)
                  };
                }
              });

              console.log('length', bills.length);
              return bills;
        });
    }
  }
}
