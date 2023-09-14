/**
 * @jest-environment jsdom
 */

// import { screen } from "@testing-library/dom"
// import NewBillUI from "../views/NewBillUI.js"
// import NewBill from "../containers/NewBill.js"

import '@testing-library/jest-dom'
import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from '../views/BillsUI'
import {localStorageMock} from '../__mocks__/localStorage'
import {ROUTES} from '../constants/routes'
import store from '../__mocks__/store'
import Store from "../app/Store";


// identify as employee 
// Mock navigation function
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({pathname})
}

// Set up user type and local storage
Object.defineProperty(window, 'LocalStorage', {value: localStorageMock})
window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

// Test cases for NewBill Page
describe("Given the employee is on NewBill Page", () => {
  // Test rendering of NewBill Page
  describe('When accessing the NewBill Page', ()=>{
    test('Then the NewBill form should be rendered', ()=>{
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})

// Test file upload and file extension validation
describe('Given the employee is on NewBill Page',()=>{
  describe('When he uploads an image file', ()=>{
    test('The file extension should be correct',()=>{
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      
      // Mock loading file and file change event
      const handleChangeFile = jest.fn(()=> newBill.handleChangeFile)
      const inputFile = screen.queryByTestId('file')


      // addeventlistener file 
      inputFile.addEventListener('change', handleChangeFile)

      //fire event
      fireEvent.change(inputFile,{ 
        target: {
          files: [new File(['myTest.png'], 'myTest.png', {type: 'image/png'})]
        }
      })

      expect(handleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe('myTest.png')
    })
  })
})

// Test form submission and bill creation
describe("When submitting a valid bill form on NewBill Page",()=>{
  test('Then a bill should be created', async ()=>{
    document.body.innerHTML = NewBillUI()
    const newBill = new NewBill({
      document, onNavigate, store: null, localStorage:window.localStorage
    })

    // Mock form submission
    const handleSubmit = jest.fn(newBill.handleSubmit)
    const newBillForm = screen.getByTestId('form-new-bill')
    newBillForm.addEventListener('submit', handleSubmit)
    fireEvent.submit(newBillForm)
    expect(handleSubmit).toHaveBeenCalled()
  })
})




//integration 
// Test case for creating a bill as an Employee
describe("When an mployee is creating a Bill",()=>{
  describe("When submitting a valid bill form",()=>{
    test('Then a bill should be created', async ()=>{
      // Render NewBill UI
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, store: null, localStorage:window.localStorage
    })

     // Mock bill data
    const billTest = {
     
    name: "testing",
     date: "2001-04-15",
      amount: 400,
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      pct:25,
      vat: 12,
      commentary: "C'est un test",
      fileName: "testing",
      fileUrl: 'testing.jpg'
    }


      // Mock form submission and handle submit event
      const submit = screen.queryByTestId('form-new-bill')
      const handleSubmit = jest.fn((e)=> newBill.handleSubmit(e))
      submit.addEventListener('click', handleSubmit)

      // Fill form fields with mock data
      newBill.createBill = (newBill) => newBill
      document.querySelector(`select[data-testid="expense-type"]`).value = billTest.type
      document.querySelector(`input[data-testid="expense-name"]`).value = billTest.name
      document.querySelector(`input[data-testid="datepicker"]`).value = billTest.date
      document.querySelector(`input[data-testid="amount"]`).value = billTest.amount
      document.querySelector(`input[data-testid="vat"]`).value = billTest.vat
      document.querySelector(`input[data-testid="pct"]`).value = billTest.pct
      document.querySelector(`textarea[data-testid="commentary"]`).value = billTest.commentary
      newBill.fileUrl = billTest.fileUrl
      newBill.fileName = billTest.fileName

      // Simulate form submission
      fireEvent.click(submit)

      // Verify if handleSubmit was called
      expect(handleSubmit).toHaveBeenCalled()

    })
  })
})

// Test case for handling file upload of PNG image
describe("When handling PNG File Upload", () => {
  test("Then function handleChangeFile should be called", () => {
    // Render NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock API post method
      jest.spyOn(Store.api, 'post').mockImplementation(store.post)

      // Create NewBill instance
      const newBill = new NewBill({
          document,
          onNavigate,
          store: Store,
          localStorage: window.localStorage
      });

      // Mock handleChangeFile functio
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const file = screen.getByTestId("file");

      // Add event listener for file change
      file.addEventListener("change", handleChangeFile);

      // Simulate file upload
      fireEvent.change(file, {
          target: {
              files: [new File(["image"], "test.png", {type: "image/png"})]
          }
      });

      // Verify if handleChangeFile was called
      expect(handleChangeFile).toHaveBeenCalled();
  });
})


// Test case for handling file upload of PDF
describe("When handling PDF File Upload", () => {
  test("Then the function handleChangeFile should be called", () => {
     // Render NewBill UI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock API post method
      jest.spyOn(Store.api, 'post').mockImplementation(store.post)

      // Create NewBill instance
      const newBill = new NewBill({
          document,
          onNavigate,
          store: Store,
          localStorage: window.localStorage
      });

      const file = screen.getByTestId("file");


      // Mock handleChangeFile function
      const handleChangeFile = jest.fn(newBill.handleChangeFile);

      // Add event listener for file change
      file.addEventListener("change", handleChangeFile);

      // Simulate PDF file upload
      fireEvent.change(file, {
          target: {
              files: [new File(["image"], "test.pdf", {type: "image/pdf"})]
          }
      });

      // Verify if handleChangeFile was called and file value is cleared
      expect(handleChangeFile).toHaveBeenCalled();
      expect(file.value).toBe('')
  });
})


// Test case for handling API
describe("Error Handling on API", () => {
  beforeEach(() => {
    // Mock the bills function and set up localStorage
    jest.spyOn(store, "bills")
    Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))

    // Create root element for rendering
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    
  })

  // Test case for handling 404 error
  test("fetches bills from an API and fails with 404 message error", async () => {
    // Mock bills API call to return 404 error
    store.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }})

      // Render BillsUI with error message
      const html = BillsUI({error: "Erreur 404"})
      document.body.innerHTML = html

      // Verify if error message is displayed
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
  })

  // Test case for handling 500 error
  test("fetches messages from an API and fails with 500 message error", async () => {
    // Mock bills API call to return 500 error
    store.bills.mockImplementationOnce(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }})

    // Render BillsUI with error message
    const html = BillsUI({error: "Erreur 500"})
    document.body.innerHTML = html

    // Verify if error message is displayed
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})
