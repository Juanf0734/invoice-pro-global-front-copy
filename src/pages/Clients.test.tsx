// src/pages/Clients.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Clients from "./Clients";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";

// Mocks
vi.mock("@/lib/api", () => ({
    getApiUrl: (path: string) => path,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (k: string) => k }),
}));

// Mock sonner toast
const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

// Helpers
function makeToken(companyId: number) {
    const header = btoa(JSON.stringify({ alg: "none" }));
    const payload = btoa(JSON.stringify({ IdEmpresa: companyId }));
    return `${header}.${payload}.sig`;
}

function deferredPromise<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// fetch handler state controlled per test
let createResponse: any = null;
let createDeferred: any = null;
let nextClientsList: any = null;

const defaultAuxResponse = {
    codResponse: 1,
    basePresentationList: [{ Codigo: 44, Descripcion: "Colombia", InfoAdicional: "CO" }],
};

const defaultTiposId = {
    codResponse: 1,
    basePresentationList: [{ Codigo: 31, Descripcion: "Cédula" }],
};

const defaultTiposPersona = {
    codResponse: 1,
    basePresentationList: [{ Codigo: 1, Descripcion: "Persona Natural" }, { Codigo: 2, Descripcion: "Persona Jurídica" }],
};

const defaultRegimenes = {
    codResponse: 1,
    basePresentationList: [{ Codigo: 1, Descripcion: "Comun" }],
};

beforeEach(() => {
    // reset mocks
    toastMock.success.mockClear();
    toastMock.error.mockClear();
    createResponse = null;
    createDeferred = null;
    nextClientsList = null;

    // Mock localStorage if not present
    // global.localStorage is available in jsdom, but ensure clear
    localStorage.clear();

    // Mock global.fetch
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        // Aux endpoints
        if (url.includes("/Auxiliar/ListaPaises")) {
            return {
                ok: true,
                json: async () => defaultAuxResponse,
                text: async () => JSON.stringify(defaultAuxResponse),
            };
        }
        if (url.includes("/Auxiliar/ListaTiposIdentificacion")) {
            return {
                ok: true,
                json: async () => defaultTiposId,
                text: async () => JSON.stringify(defaultTiposId),
            };
        }
        if (url.includes("/Auxiliar/ListaTiposPersona")) {
            return {
                ok: true,
                json: async () => defaultTiposPersona,
                text: async () => JSON.stringify(defaultTiposPersona),
            };
        }
        if (url.includes("/Auxiliar/ListaRegimenesFiscales")) {
            return {
                ok: true,
                json: async () => defaultRegimenes,
                text: async () => JSON.stringify(defaultRegimenes),
            };
        }

        // Traer clientes
        if (url.includes("/Empresa/TraerClientes")) {
            const clientsResp = nextClientsList ?? { codResponse: 1, basePresentationList: [] };
            return {
                ok: true,
                json: async () => clientsResp,
                text: async () => JSON.stringify(clientsResp),
            };
        }

        // Crear cliente endpoint
        if (url.includes("/Cliente/CrearCliente")) {
            if (createDeferred) {
                // return a promise that will resolve later (for loading test)
                return {
                    ok: true,
                    text: () => createDeferred.promise.then((resp: any) => JSON.stringify(resp)),
                    json: async () => { /* never used here */ return {}; },
                };
            }
            const resp = createResponse ?? { codResponse: 1 };
            return {
                ok: true,
                text: async () => JSON.stringify(resp),
                json: async () => resp,
            };
        }

        // Fallback generic response
        return {
            ok: true,
            json: async () => ({ codResponse: 1, basePresentationList: [] }),
            text: async () => JSON.stringify({ codResponse: 1 }),
        };
    }));
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("Clients page - form submit behaviors", () => {
    it("successful submit: opens form, fills, submits and closes dialog and shows success toast", async () => {
        // Arrange
        localStorage.setItem("authToken", makeToken(123));
        createResponse = { codResponse: 1 };
        nextClientsList = { codResponse: 1, basePresentationList: [{ Codigo: 1, Descripcion: "Cliente A", InfoAdicional: "a@a.com" }] };

        render(<Clients />);

        // Wait for new client button to be present
        const newBtn = await screen.findByRole("button", { name: /clients.newClient/i });
        expect(newBtn).toBeInTheDocument();

        // Open form
        fireEvent.click(newBtn);

        // Fill required fields
        const nombre = await screen.findByLabelText(/newInvoice.clientName/i);
        const nit = await screen.findByLabelText(/newInvoice.taxId/i);

        fireEvent.change(nombre, { target: { value: "Cliente Test" } });
        fireEvent.change(nit, { target: { value: "90012345" } });

        // Submit
        const saveBtn = screen.getByRole("button", { name: /clients.createClient/i });
        fireEvent.click(saveBtn);

        // Wait for dialog to close - nombre input should be removed
        await waitFor(() => {
            expect(screen.queryByLabelText(/newInvoice.clientName/i)).not.toBeInTheDocument();
        });

        // toast.success should have been called with the create key
        expect(toastMock.success).toHaveBeenCalled();
    });

    it("validation/server error: server returns error -> toast.error called and form remains open", async () => {
        // Arrange
        localStorage.setItem("authToken", makeToken(123));
        createResponse = { codResponse: 0, message: "Invalid data" }; // server error
        nextClientsList = { codResponse: 1, basePresentationList: [] };

        render(<Clients />);

        // Wait and open form
        const newBtn = await screen.findByRole("button", { name: /clients.newClient/i });
        fireEvent.click(newBtn);

        const nombre = await screen.findByLabelText(/newInvoice.clientName/i);
        const nit = await screen.findByLabelText(/newInvoice.taxId/i);

        fireEvent.change(nombre, { target: { value: "Cliente Error" } });
        fireEvent.change(nit, { target: { value: "123" } });

        const saveBtn = screen.getByRole("button", { name: /clients.createClient/i });
        fireEvent.click(saveBtn);

        // Expect toast.error called and form still present
        await waitFor(() => {
            expect(toastMock.error).toHaveBeenCalled();
        });

        // Form still open: nombre input present
        expect(screen.getByLabelText(/newInvoice.clientName/i)).toBeInTheDocument();
    });

    it("submit button is disabled while saving (isSaving true)", async () => {
        // Arrange
        localStorage.setItem("authToken", makeToken(123));
        // Make the create endpoint deferred so we can assert disabled state while pending
        const deferred = deferredPromise<any>();
        createDeferred = deferred;
        // After resolving deferred we'll return success and clients refresh
        nextClientsList = { codResponse: 1, basePresentationList: [] };

        render(<Clients />);

        // Open form
        const newBtn = await screen.findByRole("button", { name: /clients.newClient/i });
        fireEvent.click(newBtn);

        const nombre = await screen.findByLabelText(/newInvoice.clientName/i);
        const nit = await screen.findByLabelText(/newInvoice.taxId/i);

        fireEvent.change(nombre, { target: { value: "Cliente Loading" } });
        fireEvent.change(nit, { target: { value: "800000" } });

        const saveBtn = screen.getByRole("button", { name: /clients.createClient/i });

        // Click save -> isSaving becomes true synchronously before fetch resolves
        fireEvent.click(saveBtn);

        // Immediately button should be disabled
        expect(saveBtn).toBeDisabled();

        // Resolve the deferred to simulate server response
        deferred.resolve({ codResponse: 1 });

        // Wait for dialog to close and button to be re-enabled (component unmounts dialog)
        await waitFor(() => {
            expect(screen.queryByLabelText(/newInvoice.clientName/i)).not.toBeInTheDocument();
        });

        // toast.success should have been called
        expect(toastMock.success).toHaveBeenCalled();
    });
});