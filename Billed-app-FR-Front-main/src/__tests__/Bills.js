/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from '../containers/Bills';
import router from "../app/Router.js";
import {ROUTES} from '../constants/routes'
import store from '../__mocks__/store.js';

// describe("Given I am connected as an employee", () => {
//   describe("When I am on Bills Page", () => {
//     test("Then bill icon in vertical layout should be highlighted", async () => {

//       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
//       window.localStorage.setItem('user', JSON.stringify({
//         type: 'Employee'
//       }))
//       const root = document.createElement("div")
//       root.setAttribute("id", "root")
//       document.body.append(root)
//       router()
//       window.onNavigate(ROUTES_PATH.Bills)
//       await waitFor(() => screen.getByTestId('icon-window'))
//       const windowIcon = screen.getByTestId('icon-window')
//       //to-do write expect expression

//     })
//     test("Then bills should be ordered from earliest to latest", () => {
//       document.body.innerHTML = BillsUI({ data: bills })
//       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
//       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
//       const datesSorted = [...dates].sort(antiChrono)
//       expect(dates).toEqual(datesSorted)
//     })
//   })
// })

describe("Employee View on Bills Page", () => {
  describe("When accessing the Bills Page", () => {
    test("The bill icon in the vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      // Prepare root element and render app
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      // Simulate router navigation to Bills Page
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // Wait for bill icon to be visible
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

      expect(windowIcon).toHaveClass('active-icon')

    })
    test("Bills should be displayed in ascending order of dates", () => {
      // Load bills data into UI
      document.body.innerHTML = BillsUI({
        data: bills
      })

      // Extract bill dates and sort them
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)

      // Check if the displayed dates are in ascending order
      expect(dates).toEqual(datesSorted)
    })
  })
})


describe('Employee Bill Data Retrieval',()=>{
  describe('When navigating to the Bill Page',()=>{
   test('Fetching bills should return bill data', () => {
     const onNavigate = (pathname) => {
       document.body.innerHTML = ROUTES({ pathname })
     }

     Object.defineProperty(window, 'localStorage', { value: localStorageMock })

     store.bills = jest.fn().mockImplementationOnce(() => {
       return {
         list: jest.fn().mockResolvedValue([{ id: 1, data: () => ({ date: '' }) }])
       }
     })

     const bills = new Bills({
       document, onNavigate, store: store, localStorage
     })

     const result = bills.getBills()

     expect(result).toEqual(Promise.resolve({}))
   })
  })
})

describe("Given I attempt to access Bill page as an Employee", () => {
  describe("When I am on the Login Page", () => {
    test("Then the LoadingPage should be displayed", () => {
      // Render LoadingPage
      document.body.innerHTML = BillsUI({
        loading: true
      });
      
      // Check for LoadingPage text
      expect(screen.getAllByText('Loading...')).toBeTruthy();
    });

    test("Then the ErrorPage should be displayed", () => {
      // Render ErrorPage
      document.body.innerHTML = BillsUI({error: true});
      
      // Check for ErrorPage text
      expect(screen.getAllByText('Erreur')).toBeTruthy();
    });
  });
});

describe("When I am on the Bills page but receive a backend error message", () => {
  test("Then the ErrorPage should be displayed", () => {
    // Render ErrorPage with backend error
    document.body.innerHTML = BillsUI({
      error: 'some error message'
    });
    
    // Check for ErrorPage text
    expect(screen.getAllByText('Erreur')).toBeTruthy();
  });
});

describe("When there are bills on the Bill page", () => {
  test("An icon-eye should be displayed", () => {
    // Render BillPage with bill data
    document.body.innerHTML = BillsUI({data: bills});
    
    // Check for icon-eye presence
    const iconEye = screen.getAllByTestId('icon-eye');
    expect(iconEye).toBeTruthy();
  });
});


describe('Given I am an employee', () => {
  describe('When I navigate to the Bill page', () => {
    test('When I click on the "New Bill" button, a modal should open', () => {
      // Set up the initial conditions and render UI
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({
          pathname
        });
      };
      
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      });
      
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }));
      
      document.body.innerHTML = BillsUI({
        data: bills
      });
      
      // Instantiate the Bills component
      const bill = new Bills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage
      });
      
      // Mock the modal function
      $.fn.modal = jest.fn();
      
      // Add event listener for the "click" event
      const handleClickNewBill = jest.fn(() => {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        });
        iconNewBill.dispatchEvent(event);
      });
      
      const iconNewBill = screen.getByTestId('btn-new-bill');
      iconNewBill.addEventListener('click', handleClickNewBill);
      
      // Trigger the click event
      iconNewBill.click();
      
      // Assert that the click handler was called
      expect(handleClickNewBill).toHaveBeenCalled();
      
      // Assert that the modal was opened
      const modal = screen.getAllByTestId('form-new-bill');
      expect(modal).toBeTruthy();
    });
  });
});


//test d'integration
describe('Integration Test: Employee Access to Bill Details', ()=>{
  describe('When navigating to the Bill page', ()=>{

    test('Clicking on the eye icon should open a modal with bill details', async()=>{
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
      
      Object.defineProperty(window, 'localStorage', {value: localStorageMock})
      window.localStorage.setItem('user', JSON.stringify({type:'Employee'}))

      // Set user type and prepare Bills UI
      const html = BillsUI({data: bills})
      document.body.innerHTML= html

      // Instantiate Bills component
      const bill = new Bills({
        document, onNavigate, store:null, bills, localStorage: window.localStorage
      })

      // Mock the modal function
      $.fn.modal = jest.fn()

      // Simulate clicking the eye icon
      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye))      
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)

      // Check if the click handler was called and the modal is displayed
      expect(handleClickIconEye).toHaveBeenCalled();
      expect(screen.getByTestId('modaleFile')).toBeTruthy();
    })
  })
})

//test integration GET
describe('Employee Navigation to Bill Page',()=>{
  describe('When navigating to the Bill page',()=>{
    test("Fetching bills from mock API GET", async () => {

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      // check for content
      const contentPending = await screen.getByText("Mes notes de frais")
      expect(contentPending).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    describe("When an API error occurs", () => {
     beforeEach(() => {
      // Spy on the store.bills method
       jest.spyOn(store, "bills")

       // Mock local storage and user access
       Object.defineProperty(
           window,
           'localStorage',
           { value: localStorageMock }
       )
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee',
         email: "a@a"
       }))

       // Prepare root element and render app
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.appendChild(root)
       router()
     })

     test("Fetching bills from API fails with 404 error message", async () => {
      // Mock API response with 404 error
       store.bills.mockImplementationOnce(() => {
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 404"))
           }
         }})

         // Render ErrorPage with 404 error
         const html = BillsUI({error: "Erreur 404"})
         document.body.innerHTML = html

         // Check if the error message is visible
         const message = await screen.getByText(/Erreur 404/)
         expect(message).toBeTruthy()
     })
 
     test("Fetching bills from API fails with 500 error message", async () => {
      // Mock API response with 500 error
       store.bills.mockImplementationOnce(() => {
         return {
           list : () =>  {
             return Promise.reject(new Error("Erreur 500"))
           }
         }})
 
         // Render ErrorPage with 500 error
       const html = BillsUI({error: "Erreur 500"})
       document.body.innerHTML = html

       // Check if the error message is visible
       const errorMessage = await screen.getByText(/Erreur 500/)
       expect(errorMessage).toBeTruthy()
     })
   })
  })
})
