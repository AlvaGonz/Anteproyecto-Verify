$types = [Reflection.Assembly]::LoadFrom('c:\Users\Admin\Desktop\Anteproyecto-Verify\src\backend\Api\bin\Debug\net8.0\Stripe.net.dll').GetTypes()
foreach ($t in $types) { 
    if ($t.Name -eq 'Subscription') { 
        $t.GetProperties() | Select-Object Name 
    } 
}
