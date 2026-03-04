Yes — client2 already has several non-super-admin views.

Production Team dashboard exists at /production/dashboard/ and is group-protected in views.py:4388-4394, routed in urls.py:91-99.
Account Manager dashboard exists at /dashboard/ (group-protected), defined in views.py:316-323, routed in urls.py:15-17.
Vendor portal exists at /vendor/ and /vendor/dashboard/, routed in urls.py:530-538.
Client portal exists at /client-portal/, routed in urls.py:526-529.
Storefront pages exist (public/client-side) at /storefront/... in urls.py:76-84.
Why your production user lands on admin:

Login redirect currently sends any is_staff user to admin dashboard in views.py:5017-5020.
Admin dashboard only requires staff_member_required in views.py:9119-9124.