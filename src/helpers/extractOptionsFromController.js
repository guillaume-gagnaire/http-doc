export default function extractOptionsFromController (controller) {
  if (!controller) return {}

  return {
    title: controller.protoype.apiTitle ?? '',
    description: controller.protoype.apiDescription ?? '',
    returns: controller.protoype.apiReturns ?? {},
    accepts: controller.protoype.apiAccepts ?? null
  }
}
