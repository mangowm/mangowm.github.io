import { getHost } from "./platform";

export async function isOnboardingCompleted(): Promise<boolean> {
  try {
    return (await getHost().preferences.read()).onboardingCompleted === true;
  } catch {
    return false;
  }
}

export async function completeOnboarding(): Promise<void> {
  await getHost().preferences.write({ onboardingCompleted: true });
}
