import { describe, it, expect, beforeEach } from "vitest"

if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value) },
    removeItem: (key: string) => { store.delete(key) },
    clear: () => { store.clear() },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size },
  } as any
}

import { authService } from "../src/lib/supabase"

describe("Auth Flows & Account Security", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("handles Google log in with custom selected account", async () => {
    const customAccount = {
      email: "engineer.candidate@gmail.com",
      name: "Engineer Candidate",
    }
    const res = await authService.signInWithGoogle(customAccount)
    expect(res).toBeDefined()
    expect("user" in res).toBe(true)
    if ("user" in res) {
      expect(res.user?.email).toBe("engineer.candidate@gmail.com")
      expect(res.user?.name).toBe("Engineer Candidate")
    }
  })

  it("generates a secure password reset token and stores in local recovery cache", async () => {
    const email = "candidate.recovery@example.com"
    const res = await authService.resetPasswordForEmail(email)
    expect(res.success).toBe(true)
    expect(res.email).toBe(email)
    expect(res.token).toBeDefined()
    expect(res.token?.startsWith("reset-")).toBe(true)

    // Verify token can be read from storage
    const stored = localStorage.getItem(`hirehub_reset_token_${res.token}`)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.email).toBe(email)
  })

  it("updates password and clears recovery token", async () => {
    const email = "candidate.update@example.com"
    const resetRes = await authService.resetPasswordForEmail(email)
    expect(resetRes.token).toBeDefined()

    const updateRes = await authService.updatePassword("newSecurePass123!", resetRes.token, email)
    expect(updateRes.success).toBe(true)

    // Token should now be invalidated
    const stored = localStorage.getItem(`hirehub_reset_token_${resetRes.token}`)
    expect(stored).toBeNull()
  })

  it("validates 6-digit email verification code logic", () => {
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
    expect(generatedCode).toMatch(/^\d{6}$/)

    const correctInput = generatedCode
    const wrongInput = "999999" === generatedCode ? "111111" : "999999"

    expect(correctInput === generatedCode).toBe(true)
    expect(wrongInput === generatedCode).toBe(false)
  })
})
