const yup = window.yup

const profileSchema = yup.object().shape({
    firstname: yup.string().required('firstname is required'),
    lastname: yup.string().required('lastname is required'),
    bio: yup.string(),
    socials: yup.object().shape({
        twitter: yup.string()
        .url('twitter profile link must me a valid url.')
        .matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+$/, "Must be a valid Twitter/X profile link")
        .nullable()
        .notRequired(),
        instagram: yup.string()
        .url('instagram profile link must me a valid url.')
        .matches(/^https?:\/\/(www\.)?(instagram\.com)\/[A-Za-z0-9_]+$/, "Must be a valid instagram profile link")
        .nullable()
        .notRequired(),
        github: yup.string()
        .url('github profile link must me a valid url.')
        .matches(/^https?:\/\/(www\.)?(github\.com)\/[A-Za-z0-9_]+$/, "Must be a valid github profile link")
        .nullable()
        .notRequired(),
        twitter: yup.string()
        .url('twitter profile link must me a valid url.')
        .matches(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]+$/, "Must be a valid Twitter profile link")
        .nullable()
        .notRequired(),
    })
})

async function validateProfile(e){
    e.preventDefault();
    const form = e.target;
    const formData = {
        firstname: form.firstname.value,
        lastname: form.lastname.value,
        bio: form.bio.value,
        socials: {
            twitter: form['socials[twitter]'].value,
            instagram: form['socials[instagram]'].value,
            github: form['socials[github]'].value,
            }

    }

    try{
        await profileSchema.validate(formData);
        e.target.submit();
    }catch(err){
        alert('frontend validation failed, for more details see console');
        console.error(err);
    }
}