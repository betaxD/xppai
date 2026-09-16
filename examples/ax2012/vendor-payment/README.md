# AX 2012 R3 automatic vendor invoice payment

Preliminary X++ implementation that pays the full open balance of one posted
vendor invoice. It creates a vendor payment journal line, uses a bank offset,
marks the selected `VendTransOpen` record through `SpecTransManager`, and
optionally posts the journal with `LedgerJournalCheckPost`.

Dynamic vendor and bank accounts are resolved with
`DimensionStorage::getDynamicAccount`, the AX 2012 account/dimension API.

It does **not** create a vendor invoice and does not write directly to posted
voucher or settlement tables.

## AOT objects

Create these classes in this order:

1. `XppAiVendPaymentContract`
2. `XppAiVendPaymentResultContract`
3. `XppAiVendPaymentService`
4. `XppAiVendPaymentAifService`
5. `XppAiVendPaymentController`

Create an **Action** menu item pointing to
`XppAiVendPaymentController.main`, then grant it through a dedicated privilege,
duty, and role. Replace the `XppAi` prefix and literal messages with the
project naming convention and label file.

## AIF custom service

`XppAiVendPaymentAifService.payInvoice` is the stable AIF boundary. It delegates
to `XppAiVendPaymentService.process`, so AIF metadata is kept separate from the
payment implementation.

Create the following metadata in the AOT:

1. Under **Services**, create `XppAiVendPaymentAifService` and set its `Class`
   property to `XppAiVendPaymentAifService`.
2. Under its **Operations** node, add the `payInvoice` method and keep
   `payInvoice` as the external operation name.
3. Under **Service Groups**, create `XppAiVendPaymentServiceGroup`, add the
   service above, and deploy the group for a basic AOS-hosted endpoint; or add
   the operation to an enhanced inbound port when transforms and explicit port
   policies are required.
4. Create a dedicated privilege whose entry point is the service operation,
   grant only the required underlying table permissions, add it to a duty and
   role, and assign that role to the integration service account.
5. Generate full CIL, restart/deploy as required by the environment, refresh
   the service metadata, activate the inbound port, and verify the generated
   WSDL using the non-administrator service account.

The SOAP request contains one `XppAiVendPaymentContract` and returns one
`XppAiVendPaymentResultContract`. The contract supplies `DataAreaId`
explicitly; do not rely on the AIF user's default company.

## Behavior

- Identifies the open transaction by company, vendor account, and invoice ID.
- Pays the complete `VendTransOpen.AmountCur` balance. Partial payments are not
  accepted by this first contract.
- Creates a vendor debit with a bank offset and marks the invoice for
  settlement before posting.
- `PostPayment = Yes` posts the journal; `No` leaves it available for review.
- A retry reuses a matching unposted payment journal line.

## Required reconciliation with the target AOT

Before compiling, compare `SpecTransManager.construct/insert`,
`LedgerJournalEngine` calls, the settlement field, and the effective
`VendTransOpen` indexes against the target application's top layer. These APIs
and localization handlers can differ with CU, hotfixes, models, and Brazilian
localization customizations.

Confirm whether the method of payment requires payment generation, CNAB,
Bordero, check generation, bank remittance, workflow, approval, or electronic
signature. Posting a payment journal is not equivalent to generating or
sending the bank payment file.

## Release gates

Confirm layer/model, application and kernel builds, CU/hotfix level, partition,
company, journal type and voucher sequence, bank account, payment method,
posting profiles, exchange-rate behavior, cash discounts, withholding taxes,
regionalization, security identity, batch recurrence, and retry rules.

Compile the classes, create the security artifacts, run database synchronization
if metadata changes require it, generate full CIL, deploy to every AOS, and test
interactive and batch execution. Regression tests must cover full settlement,
already-settled invoice, duplicate invoice IDs, foreign currency, closed fiscal
period, invalid bank account, cash discount, withholding taxes, posting failure,
and retry of a journal created but not posted.
