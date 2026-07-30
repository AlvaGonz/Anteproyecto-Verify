import os

path = 'e2e/projects/settings-extension.spec.ts'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# The frontend shows a confirmation modal after clicking "Guardar Cambios".
# The modal has a "Confirmar y Guardar" button that actually triggers the save.
# We need to insert a click on that confirm button before checking the toast.

old_block = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await expect(saveButton).toBeEnabled({ timeout: 2000 });
    await saveButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });"""

new_block = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await expect(saveButton).toBeEnabled({ timeout: 2000 });
    await saveButton.click();

    const confirmButton = page.getByRole('button', { name: /Confirmar y Guardar/i });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });"""

count = c.count(old_block)
c = c.replace(old_block, new_block)
print(f'TC-02: replaced {count} occurrence(s)')

# TC-03 - same flow
old_block_3 = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });
  });

  test('TC-04:"""

new_block_3 = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    const confirmButton = page.getByRole('button', { name: /Confirmar y Guardar/i });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible({ timeout: 5000 });
  });

  test('TC-04:"""

count = c.count(old_block_3)
c = c.replace(old_block_3, new_block_3)
print(f'TC-03: replaced {count} occurrence(s)')

# TC-06 - same flow but expects error toast
old_block_6 = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    await expect(page.locator('text=El apodo ya está en uso por otro usuario.')).toBeVisible({ timeout: 5000 });"""

new_block_6 = """    const saveButton = page.locator('button[type="submit"]:has-text("Guardar Cambios")');
    await saveButton.click();

    const confirmButton = page.getByRole('button', { name: /Confirmar y Guardar/i });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    await expect(page.locator('text=El apodo ya está en uso por otro usuario.')).toBeVisible({ timeout: 5000 });"""

count = c.count(old_block_6)
c = c.replace(old_block_6, new_block_6)
print(f'TC-06: replaced {count} occurrence(s)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Done.')
