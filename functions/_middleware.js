export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  if (url.hostname === "obxncinsurance.com" || url.hostname === "obxncinsurance.pages.dev") {
    url.hostname = "www.obxncinsurance.com";
    return Response.redirect(url.toString(), 301);
  }

  return next();
}
