from setuptools import setup, find_packages

setup(
    name = 'hypernotes',
    version = '0.1',
    packages = find_packages(),
    install_requires = [
        "Flask==0.7.2",
        "Flask-Login==0.1",
        "pyes==0.16.0"
        ],
    # metadata for upload to PyPI
    url = 'http://github.com/okfn/hypernotes',
    author = 'Open Knowledge Foundation',
    author_email = 'info@okfn.org',
    description = 'Note-taking meets the web.',
    license = 'AGPL',
    classifiers = [
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)

