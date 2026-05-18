export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export const emptyActionState: ActionState = {
  ok: false,
  message: "",
};

export function actionError(message: string): ActionState {
  return { ok: false, message };
}

export function actionSuccess(message: string): ActionState {
  return { ok: true, message };
}
