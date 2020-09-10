import countryList, { Country } from '../data-stores/country-list';

export class CountryService {
    getCountries(name: string = '') {
        return countryList.filter((c) => {
            return c.name.toLowerCase().includes(name.toLowerCase());
        })
    }

    getCountryByName(name: string = '') {
        if (!name) return null;
        return countryList.find((c) => c.name.toLowerCase() == name.toLowerCase());
    }

    getCountryByDialCode(code: string = '') {
        if (!code) return null;
        return countryList.find((c) => c.dial_code.toLowerCase() == code.toLowerCase());
    }

    getCountryByCode(code: string) {
        if (!code) return null;
        return countryList.find((c) => c.code.toLowerCase() == code.toLowerCase());
    }

    getCountryDetailsByName(name: string = '') {
        let country = this.getCountryByName(name);

        return {
            name: country.name,
            code: country.code
        }
    }

    parsePhone(phoneNumber: string) {
        let phone = phoneNumber;
        let dial_code = '';
        let country: Country;

        for (let i = 0; i < countryList.length; i++) {
            let c = countryList[i];

            if (phoneNumber.includes(c.dial_code)) {
                phone = phoneNumber.replace(c.dial_code, '');
                dial_code = c.dial_code;
                country = c;
                break;
            }
        };

        return { phone, dial_code, country }
    }
}

export default new CountryService();