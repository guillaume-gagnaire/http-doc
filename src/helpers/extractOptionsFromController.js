export default function extractOptionsFromController (controller) {
  if (!controller) return {}

  return {
    title: controller.protoype.apiTitle ?? '',
    description: controller.protoype.apiDescription ?? '',
    returns: controller.protoype.apiReturns ?? {},
    parameters: controller.protoype.apiParameters ?? {},
    accepts: controller.protoype.apiAccepts ?? null,
    access: controller.protoype.apiAccess ?? true
  }
}
